//Anilist Query to get anime data
//get next airing episode
var query = `
query ($search: String) {
    Media (search: $search, type: ANIME) {
        id
        siteUrl
        title {
            romaji
            native
        }
        description
        episodes
        trailer {
            id
            site
        }
        nextAiringEpisode {
            episode
        }
        coverImage {
            large
            medium
            color
        }
        averageScore
        meanScore
        trailer {
            id
            site
        }
        endDate {
            year
            month
            day
        }
        startDate {
            year
            month
            day
        }
    }
}
`;

async function fetchData(inputTitle){
    //Fetch the data
    const url = 'https://graphql.anilist.co'
    const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                query: query,
                //Variables for the query
                variables: {
                    search: inputTitle
                }
            })
        };

    //Make the HTTP Api request
    let data = await fetch(url, options)
                        .then(handleResponse)
                        .then(handleData)
                        .catch(handleError);
    //console.log(data)
    return data
}

//Handle response
function handleResponse(response) {
    //console.log('Response Recieved');
    return response.json()
        .then(function (json) {
            return response.ok ? json : Promise.reject(json);
    });
}
//Handle data
function handleData(data){
    //console.log('Data Recieved');
    //console.log(data);
    const anime = data.data.Media;
    const animeTitle = anime.title.romaji,
          animeSite = anime.siteUrl,
          animeDescription = anime.description,
          animeAverage = anime.averageScore + '%',
          animeMean = anime.meanScore + '%',
          animeStartDate = anime.startDate.year + '/' + anime.startDate.month + '/' + anime.startDate.day,
          animeCover = anime.coverImage.large;
        //Check if anime is ongoing
        if (anime.episodes == null) {
            animeEpisodes = JSON.stringify((anime.nextAiringEpisode.episode - 1));
        } else {
            animeEpisodes = JSON.stringify(anime.episodes);
        }
        //Check if anime trailer is available
        if (anime.trailer == null) {
            animeTrailer = 'No trailer available';
        } else {
            animeTrailer = 'https://www.youtube.com/watch?v=' + anime.trailer.id;
        }
        //Check if anime has ended
        if (anime.endDate.year == null) {
            animeEndDate = 'Ongoing';
        } else {
            animeEndDate = anime.endDate.year + '/' + anime.endDate.month + '/' + anime.endDate.day;
        }

    //Create embed with anime data
    const { EmbedBuilder } = require('discord.js');
    const animeEmbed = new EmbedBuilder()
        .setThumbnail(animeCover)
        .setColor(0x0099FF)
        .setTitle(animeTitle)
        .setURL(animeSite)
        .setDescription(animeDescription)
        .addFields(
            //Row Spacer
            { name: '\u200B', value: '\u200B' , inline: true },
            { name: '\u200B', value: '\u200B' , inline: true },
            { name: '\u200B', value: '\u200B' , inline: true },
            //First Row
            { name: 'Episodes', value: animeEpisodes , inline: true },
            { name: '\u200B', value: '\u200B' , inline: true },
            { name: '\u200B', value: '\u200B' , inline: true },
            //Second Row
            { name: 'AverageScore', value: animeAverage , inline: true},
            { name: 'MeanScore', value: animeMean , inline: true},
            { name: '\u200B', value: '\u200B' , inline: true },
            //Third Row
            { name: 'StartDate', value: animeStartDate , inline: true},
            { name: 'EndDate', value: animeEndDate , inline: true },
            { name: '\u200B', value: '\u200B' , inline: true },
            //Last Row
            { name: 'Trailer', value: animeTrailer },
        )

        .setTimestamp()
        .setFooter({ text: 'Powered by Anilist.co', iconURL: 'https://anilist.co/img/icons/android-chrome-512x512.png' });

    //Set animeEmbed as object then return object
    const embed = { embeds: [animeEmbed] }
    return embed
}
//Handle errors
function handleError(error) {
    console.log('Error, check console');
    console.error(error);
    //returns text to reply with an error
    return 'Anime Not Found..'
}

//Discord slash command
const { SlashCommandBuilder } = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('anime')
		.setDescription('Gets anime information by name.')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Anime name.')),
	async execute(interaction) {;
        const animeName = interaction.options.getString('name');
        fetchData(animeName)
            .then(data => interaction.reply(data))
	},
};
