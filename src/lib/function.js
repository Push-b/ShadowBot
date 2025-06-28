const axios = require('axios').default
const { tmpdir } = require('os')
const { promisify } = require('util')
const moment = require('moment-timezone')
const FormData = require('form-data')
const { load } = require('cheerio')
const { exec } = require('child_process')
const { createCanvas } = require('canvas')
const { sizeFormatter } = require('human-readable')
const { readFile, unlink, writeFile } = require('fs-extra')
const { removeBackgroundFromImageBase64 } = require('remove.bg')

const verifyWin = (board, player1, player2) => {
    const winningCombos = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];
    const hasWon = (board, symbol) => {
        let winner = false;
        winningCombos.map((combo) => {
            if (board[combo[0]] === symbol && board[combo[1]] === symbol && board[combo[2]] === symbol) {
                winner = true;
            }
        });
        return winner;
    };
    const player1Symbol = 'X';
    const player2Symbol = 'O';
    if (hasWon(board, player1Symbol)) return player1;
    if (hasWon(board, player2Symbol)) return player2;
    return 'draw';
}

const displayBoard = async (Board) => {
    const board = Board; // No need to cast types in JavaScript

    // Function to generate text representation of the board
    const generateTextBoard = (board) => {
        return `
         ${board[0] || ' '} | ${board[1] || ' '} | ${board[2] || ' '}\n
         ${board[3] || ' '} | ${board[4] || ' '} | ${board[5] || ' '}\n
         ${board[6] || ' '} | ${board[7] || ' '} | ${board[8] || ' '}\n
        `;
    };

    const textBoard = generateTextBoard(board);
    return textBoard;
};

/**
 * @param {number} min 
 * @param {number} max 
 * @returns {number}
 */
const getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

/**
 * @param {string} url
 * @returns {Promise<Buffer>}
 */

const getBuffer = async (url) =>
    (
        await axios.get(url, {
            responseType: 'arraybuffer'
        })
    ).data

/**
 * @param {string} content
 * @param {boolean} all
 * @returns {string}
 */

const capitalize = (content, all = false) => {
    if (!all) return `${content.charAt(0).toUpperCase()}${content.slice(1)}`
    return `${content
        .split('')
        .map((text) => `${text.charAt(0).toUpperCase()}${text.slice(1)}`)
        .join('')}`
}

/**
 * @param {Buffer} input
 * @returns {Promise<Buffer>}
 */

const removeBG = async (input) => {
    try {
        const response = await removeBackgroundFromImageBase64({
            base64img: input.toString('base64'),
            apiKey: process.env.BG_API_KEY,
            size: 'auto',
            type: 'auto'
        })
        return Buffer.from(response.base64img, 'base64')
    } catch (error) {
        throw error
    }
}

/**
     * @param {string} tier
     * @returns {number}
     */

   const calculatePrice = (tier) => {
        let price = 0

        switch (tier) {
            case '1':
                price = Math.floor(Math.random() * (3000 - 2000) + 2000);
                break;
            case '2':
                price = Math.floor(Math.random() * (5000 - 3500) + 3500);
                break;
            case '3':
                price = Math.floor(Math.random() * (7000 - 5900) + 5900);
                break;
            case '4':
                price = Math.floor(Math.random() * (9000 - 7000) + 7000);
                break;
            case '5':
                price = Math.floor(Math.random() * (15000 - 1300) + 13000);
                break;
            case '6':
                price = Math.floor(Math.random() * (50000 - 35000) + 35000);
                break;
            case 's':
                price = Math.floor(Math.random() * (100000 - 60000) + 60000);
                break;
        }
        return price;
    }
    
    /**
     * @param {string | number} pokemon - The name or ID of the Pokémon.
     * @param {number} level - The level of the Pokémon.
     * @returns {Promise<object>} An object containing the stats of the Pokémon.
     */
    const getPokemonStats = async (pokemon, level) => {
        pokemon = typeof pokemon === 'string' ? pokemon.toLowerCase() : pokemon.toString().trim();
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemon}`);
        const pokemonData = await response.data;
    
        const wantedStatsNames = ['hp', 'attack', 'defense', 'speed'];
        const wantedStats = pokemonData.stats.filter((stat) => wantedStatsNames.includes(stat.stat.name));
    
        const pokemonStats = {
            hp: 0,
            attack: 0,
            defense: 0,
            speed: 0
        };
    
        wantedStats.forEach((stat) => {
            pokemonStats[stat.stat.name] = Math.floor(stat.base_stat + level * (stat.base_stat / 50));
        });
    
        return pokemonStats;
    };
    
    /**
     * @param {string} pokemon - The name of the Pokémon.
     * @returns {Promise<string[]>} An array of Pokémon names in the evolution chain.
     */
    const getPokemonEvolutionChain = async (pokemon) => {
        const response1 = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${pokemon}`);
        const data = await response1.data;
        const response2 = await axios.get(data.evolution_chain.url);
        const res = await response2.data;
        const { chain } = res;
    
        const line = [];
        const evolutions = [];
    
        line.push(chain.species.name);
    
        if (chain.evolves_to.length) {
            const second = [];
            chain.evolves_to.forEach((pkm) => second.push(pkm.species.name));
            if (second.length === 1) line.push(second[0]);
            else line.push(second);
            if (chain.evolves_to[0].evolves_to.length) {
                const third = [];
                chain.evolves_to[0].evolves_to.forEach((pkm) => third.push(pkm.species.name));
                if (third.length === 1) line.push(third[0]);
                else line.push(third);
            }
        }
    
        for (const pokemon of line) {
            if (Array.isArray(pokemon)) {
                pokemon.forEach((x) => evolutions.push(x));
                continue;
            }
            evolutions.push(pokemon);
        }
    
        return evolutions;
    };
    
    /**
     * @param {string} pokemon - The name of the Pokémon.
     * @returns {Promise<object[]>} An array of objects containing move information.
     */
    const getStarterPokemonMoves = async (pokemon) => {
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemon}`);
        const data = await response.data;
        const moves = data.moves.filter(
            (move) =>
                move.version_group_details[0].move_learn_method.name === 'level-up' &&
                move.version_group_details[0].level_learned_at <= 5
        );
    
        const result = [];
        const client = new MoveClient();
    
        for (const move of moves) {
            if (result.length >= 2) break;
            const moveData = await client.getMoveByName(move.move.name);
            const stat_change = moveData.stat_changes.map(({ change, stat }) => ({ target: stat.name, change }));
            const effect = moveData.meta && moveData.meta.ailment ? moveData.meta.ailment.name : '';
            const descriptions = moveData.flavor_text_entries.filter((x) => x.language.name === 'en');
    
            result.push({
                name: moveData.name,
                accuracy: moveData.accuracy || 0,
                pp: moveData.pp || 5,
                maxPp: moveData.pp || 5,
                id: moveData.id,
                power: moveData.power || 0,
                priority: moveData.priority,
                type: moveData.type.name,
                stat_change,
                effect,
                drain: moveData.meta ? moveData.meta.drain : 0,
                healing: moveData.meta ? moveData.meta.healing : 0,
                description: descriptions[0] ? descriptions[0].flavor_text : ''
            });
        }
    
        return result;
    };
    
    /**
     * @param {string[]} types - An array of Pokémon types.
     * @returns {Promise<object>} An object containing arrays of strong and weak types.
     */
    const getPokemonWeaknessAndStrongTypes = async (types) => {
        if (!types.length) {
            return {
                weakness: [],
                strong: []
            };
        }
    
        const strong = new Set();
        const weakness = new Set();
    
        for (const type of types) {
            const response = await axios.get(`https://pokeapi.co/api/v2/type/${type}`);
            const data = await response.data;
    
            data.damage_relations.double_damage_to.forEach((x) => weakness.add(x.name));
            data.damage_relations.half_damage_to.forEach((x) => strong.add(x.name));
            data.damage_relations.no_damage_to.forEach((x) => strong.add(x.name));
        }
    
        return {
            weakness: Array.from(weakness),
            strong: Array.from(strong)
        };
    };
    
    /**
     * @param {string} pokemon - The name of the Pokémon.
     * @param {number} level - The level of the Pokémon.
     * @param {object[]} learntMoves - An array of learnt moves.
     * @param {string[]} [rejectedMoves=[]] - An array of rejected move names.
     * @returns {Promise<object|null>} An object containing move information or null.
     */
    const getPokemonLearnableMove = async (pokemon, level, learntMoves, rejectedMoves = []) => {
        const shouldDenyMoves = learntMoves.map((move) => move.name);
    
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemon}`);
        const data = await response.data;
    
        const moves = data.moves.filter((move) =>
            move.version_group_details[0].move_learn_method.name === 'level-up' &&
            move.version_group_details[0].level_learned_at <= level &&
            !rejectedMoves.includes(move.move.name) &&
            !shouldDenyMoves.includes(move.move.name)
        );
    
        if (!moves.length) return null;
    
        const client = new MoveClient();
        const moveData = await client.getMoveByName(moves[0].move.name);
        const stat_change = moveData.stat_changes.map(({ stat, change }) => ({ target: stat.name, change }));
        const effect = moveData.meta && moveData.meta.ailment ? moveData.meta.ailment.name : '';
        const descriptions = moveData.flavor_text_entries.filter((x) => x.language.name === 'en');
    
        return {
            name: moveData.name,
            accuracy: moveData.accuracy || 0,
            pp: moveData.pp || 5,
            maxPp: moveData.pp || 5,
            id: moveData.id,
            power: moveData.power || 0,
            priority: moveData.priority,
            type: moveData.type.name,
            stat_change,
            effect,
            drain: moveData.meta ? moveData.meta.drain : 0,
            healing: moveData.meta ? moveData.meta.healing : 0,
            description: descriptions[0] ? descriptions[0].flavor_text : ''
        };
    };
    
    /**
     * @param {string} pokemon - The name of the Pokémon.
     * @param {string | number} move - The name or ID of the move.
     * @returns {Promise<boolean>} A boolean indicating if the move is learnable by the Pokémon.
     */
    const PokemonMoveIsLearnable = async (pokemon, move) => {
        const client = new MoveClient();
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemon}`);
        const { name } = await response.data;
    
        try {
            const res = typeof move === 'string'
                ? await client.getMoveByName(move)
                : await client.getMoveById(move);
    
            const pokemons = res.learned_by_pokemon.map((pokemon) => pokemon.name);
            return pokemons.includes(name);
        } catch (error) {
            return false;
        }
    };
    
    /**
     * @param {Array} array - The array to shuffle.
     * @returns {Array} The shuffled array.
     */
    const shuffleArray = (array) => {
        let counter = array.length;
        while (counter > 0) {
            const index = Math.floor(Math.random() * counter);
            counter--;
            const temp = array[counter];
            array[counter] = array[index];
            array[index] = temp;
        }
        return array;
    };
    
    /**
     * @param {string} pokemon - The name of the Pokémon.
     * @param {number} level - The level of the Pokémon.
     * @returns {Promise<object>} An object containing assigned moves and rejected moves.
     */
    const assignPokemonMoves = async (pokemon, level) => {
        let moves = shuffleArray(
            (await (await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemon}`)).data).moves.filter(
                (move) =>
                    move.version_group_details[0].move_learn_method.name === 'level-up' &&
                    move.version_group_details[0].level_learned_at <= level
            )
        );
    
        const client = new MoveClient();
        const result = [];
        const rejectedMoves = [];
    
        for (const { move } of moves) {
            if (result.length >= 4) {
                rejectedMoves.push(move.name);
                continue;
            }
            const data = await client.getMoveByName(move.name);
            const effect = data.meta && data.meta.ailment ? data.meta.ailment.name : '';
            const stat_change = [];
            const descriptions = data.flavor_text_entries.filter((x) => x.language.name === 'en');
            for (const change of data.stat_changes)
                stat_change.push({ target: change.stat.name, change: change.change });
            result.push({
                name: data.name,
                accuracy: data.accuracy || 0,
                pp: data.pp || 5,
                maxPp: data.pp || 5,
                id: data.id,
                power: data.power || 0,
                priority: data.priority,
                type: data.type.name,
                stat_change,
                effect,
                drain: data.meta ? data.meta.drain : 0,
                healing: data.meta ? data.meta.healing : 0,
                description: descriptions[0] ? descriptions[0].flavor_text : ''
            });
        }
    
        return {
            moves: result,
            rejectedMoves
        };
    };
    
    /**
     * @param {number} level - The level of the Pokémon.
     * @returns {number} The experience points required to level up.
     */
    const ExpToLvlUp = async (level) => {
        const maxExp = level <= 40 ? level * 1000 : 40000;
        return maxExp;
    };

/**
 * Copyright by (AliAryanTech), give credit!
 * @param {string} cardName
 * @param {string} expiryDate
 * @returns {Promise<Buffer}
 */

const generateCreditCardImage = (cardName, expiryDate) => {
    const canvas = createCanvas(800, 500)
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, 800, 500)
    ctx.fillStyle = '#1e90ff'
    ctx.fillRect(0, 0, 800, 80)
    ctx.fillStyle = '#555'
    ctx.font = '24px Arial, sans-serif'
    ctx.fillText('Credit Card', 40, 150)
    ctx.fillStyle = '#000'
    ctx.font = '48px Arial, sans-serif'
    ctx.fillText('1234 5678 9012 3456', 40, 250) // card numbers
    ctx.fillStyle = '#555'
    ctx.font = '24px Arial, sans-serif'
    ctx.fillText('Card Name', 40, 350)
    ctx.fillStyle = '#000'
    ctx.font = '32px Arial, sans-serif'
    ctx.fillText(cardName, 40, 400)
    ctx.fillStyle = '#555'
    ctx.font = '24px Arial, sans-serif'
    ctx.fillText('Expiry Date', 450, 350)
    ctx.fillStyle = '#000'
    ctx.font = '32px Arial, sans-serif'
    ctx.fillText(expiryDate, 450, 400)
    return canvas.toBuffer()
}

/**
 * @returns {string}
 */

const generateRandomHex = () => `#${(~~(Math.random() * (1 << 24))).toString(16)}`

/**
 * @param {string} content
 * @returns {number[]}
 */

const extractNumbers = (content) => {
    const search = content.match(/(-\d+|\d+)/g)
    if (search !== null) return search.map((string) => parseInt(string)) || []
    return []
}

/**
 * @param {string} url
 */

const fetch = async (url) => (await axios.get(url)).data

/**
 * @param {Buffer} webp
 * @returns {Promise<Buffer>}
 */

const webpToPng = async (webp) => {
    const filename = `${tmpdir()}/${Math.random().toString(36)}`
    await writeFile(`${filename}.webp`, webp)
    await execute(`dwebp "${filename}.webp" -o "${filename}.png"`)
    const buffer = await readFile(`${filename}.png`)
    Promise.all([unlink(`${filename}.png`), unlink(`${filename}.webp`)])
    return buffer
}

/**
 * @param {Buffer} webp
 * @returns {Promise<Buffer>}
 */

const webpToMp4 = async (webp) => {
    const responseFile = async (form, buffer = '') => {
        return axios.post(buffer ? `https://ezgif.com/webp-to-mp4/${buffer}` : 'https://ezgif.com/webp-to-mp4', form, {
            headers: { 'Content-Type': `multipart/form-data; boundary=${form._boundary}` }
        })
    }
    return new Promise(async (resolve, reject) => {
        const form = new FormData()
        form.append('new-image-url', '')
        form.append('new-image', webp, { filename: 'blob' })
        responseFile(form)
            .then(({ data }) => {
                const datafrom = new FormData()
                const $ = load(data)
                const file = $('input[name="file"]').attr('value')
                datafrom.append('file', file)
                datafrom.append('convert', 'Convert WebP to MP4!')
                responseFile(datafrom, file)
                    .then(async ({ data }) => {
                        const $ = load(data)
                        const result = await getBuffer(
                            `https:${$('div#output > p.outfile > video > source').attr('src')}`
                        )
                        resolve(result)
                    })
                    .catch(reject)
            })
            .catch(reject)
    })
}

/**
 * @param {Buffer} gif
 * @param {boolean} write
 * @returns {Promise<Buffer | string>}
 */

const gifToMp4 = async (gif, write = false) => {
    const filename = `${tmpdir()}/${Math.random().toString(36)}`
    await writeFile(`${filename}.gif`, gif)
    await execute(
        `ffmpeg -f gif -i ${filename}.gif -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" ${filename}.mp4`
    )
    if (write) return `${filename}.mp4`
    const buffer = await readFile(`${filename}.mp4`)
    Promise.all([unlink(`${filename}.gif`), unlink(`${filename}.mp4`)])
    return buffer
}

const greetings = () => {
    const now = new Date();
const hour = now.getHours();
let greetmsg = "";

if (hour >= 0 && hour < 12) {
    greetmsg = "🌅 Good morning"; //good morning
} else if (hour >= 12 && hour < 18) {
    greetmsg = "🌞 Good Afternoon"; //good afternoon
} else {
    greetmsg = "🌇 Good evening"; //good evening
}
return greetmsg
}

const errorChan = () => {
    let chan = "https://telegra.ph/file/7a71e4adb3de99ac6d2a2.jpg"
    return chan
}

const execute = promisify(exec)

const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)]

const calculatePing = (timestamp, now) => (now - timestamp) / 1000

const formatSize = sizeFormatter({
    std: 'JEDEC',
    decimalPlaces: '2',
    keepTrailingZeroes: false,
    render: (literal, symbol) => `${literal} ${symbol}B`
})

const term = (param) =>
    new Promise((resolve, reject) => {
        console.log('Run terminal =>', param)
        exec(param, (error, stdout, stderr) => {
            if (error) {
                console.log(error.message)
                resolve(error.message)
            }
            if (stderr) {
                console.log(stderr)
                resolve(stderr)
            }
            console.log(stdout)
            resolve(stdout)
        })
    })

const restart = () => {
    exec('pm2 start src/eximinati.js', (err, stdout, stderr) => {
        if (err) {
            console.log(err)
            return
        }
        console.log(`stdout: ${stdout}`)
        console.log(`stderr: ${stderr}`)
    })
}

/**
     *
     * @param {number} ms
     * @param {'seconds' | 'minutes' | 'hours' | 'days' | 'format'} to
     * @returns {number | { days: number; hours: number; minutes: number; seconds: number }}
     */

convertMs = (ms, to = 'seconds') => {
    let seconds = parseInt(
        Math.floor(ms / 1000)
            .toString()
            .split('.')[0]
    )
    let minutes = parseInt(
        Math.floor(seconds / 60)
            .toString()
            .split('.')[0]
    )
    let hours = parseInt(
        Math.floor(minutes / 60)
            .toString()
            .split('.')[0]
    )
    let days = parseInt(
        Math.floor(hours / 24)
            .toString()
            .split('.')[0]
    )
    if (to === 'seconds') return seconds
    if (to === 'minutes') return minutes
    if (to === 'hours') return hours
    if (to === 'days') return days
    seconds = parseInt((seconds % 60).toString().split('.')[0])
    minutes = parseInt((minutes % 60).toString().split('.')[0])
    hours = parseInt((hours % 24).toString().split('.')[0])
    return {
        days,
        seconds,
        minutes,
        hours
    }
}

  sendVideoMessage = async (from, url, M) => {
    try {
      return await this.sendMessage(
        from,
        {
          video: typeof url === "string" ? { url } : url,
          caption: "> Developed By *Deryl*",
        },
        { quoted: M },
      );
    } catch (error) {
      throw new Error(error);
    }
  };

  sendAudioMessage = async (from, url, M, ppt, contextInfo = {}) => {
    try {
      return await this.sendMessage(
        from,
        {
          audio: typeof url === "string" ? { url } : url,
          mimetype: "audio/mpeg",
          ptt: ppt ?? false,
          contextInfo: {
            ...contextInfo,
          },
        },
        { quoted: M },
      );
    } catch (error) {
      throw new Error(error);
    }
  };

  sendDocumentMessage = async (from, url, m) => {
    try {
      return await this.sendMessage(
        from,
        {
          document: typeof url === "string" ? { url } : url,
          caption: "> Developed By *Deryl*",
          mimetype: "application/pdf",
          fileName: `${~~(Math.random() * 1e9)}.pdf`,
        },
        { quoted: M },
      );
    } catch (error) {
      throw new Error(error);
    }
  };

const Tiktok = async(query) => {

    const clean = (data) => {
        let regex = /(<([^>]+)>)/gi;
        data = data.replace(/(<br?\s?\/>)/gi, " \n");
        return data.replace(regex, "");
      };

      
    let response = await axios("https://lovetik.com/api/ajax/search", {
      method: "POST",
      data: new URLSearchParams(Object.entries({ query })),
    });
  
    let result = {};

    async function shortener(url) {
        return url;
      }
      
  
    result.creator = "YNTKTS";
    result.title = clean(response.data.desc);
    result.author = clean(response.data.author);
    result.nowm = await shortener(
      (response.data.links[0].a || "").replace("https", "http")
    );
    result.watermark = await shortener(
      (response.data.links[1].a || "").replace("https", "http")
    );
    result.audio = await shortener(
      (response.data.links[2].a || "").replace("https", "http")
    );
    result.thumbnail = await shortener(response.data.cover);
    return result;
  }

module.exports = {
    getRandomInt,
    sendVideoMessage,
    sendDocumentMessage,
    sendAudioMessage,
    calculatePing,
    capitalize,
    greetings,
    errorChan,
    execute,
    extractNumbers,
    fetch,
    formatSize,
    removeBG,
    generateCreditCardImage,
    generateRandomHex,
    getBuffer,
    getRandomItem,
    gifToMp4,
    restart,
    term,
    webpToMp4,
    Tiktok,
    webpToPng,
    convertMs
}
