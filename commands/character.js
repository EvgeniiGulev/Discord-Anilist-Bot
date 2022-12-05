/**
* Author: Evgenii Gulev
* Date: 05/12/2022
* Description: Get character data by character name with anilist.co api, then send an embed with some data to user .
*/
//Modules
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
//Anilist Query to get anime character data
//get media of character
var query = `
query ($search: String) {
    Character (search: $search) {
        id
        name {
            full
            native
        }
        description
        siteUrl
        favourites
        age
        gender
        dateOfBirth{
            month
            day
        }
        image {
            large
            medium
        }
    }
}
`;


async function fetchData(characterName){
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
                    search: characterName
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
    const character = data.data.Character;
    const characterName = character.name.full,
          characterSite = character.siteUrl,
          characterImage = character.image.large,
          characterFavourites = '★' + JSON.stringify(character.favourites),
          characterAge = character.age,
          characterGender = character.gender,
          characterBirthDay = character.dateOfBirth.day + '/' + character.dateOfBirth.month,
          characterDescription = character.description.substring(0,2000);

    //Create embed with character data
    const characterEmbed = new EmbedBuilder()
        .setThumbnail(characterImage)
        .setColor(0x0099FF)
        .setTitle(characterName)
        .setURL(characterSite)
        .setDescription(characterDescription)
        //Row Spacer
        .addFields(
            { name: '\u200B', value: '\u200B' , inline: true },
            { name: '\u200B', value: '\u200B' , inline: true },
            { name: '\u200B', value: '\u200B' , inline: true },
        )
        //First Row
        .addFields(
            { name: 'Favourites', value: characterFavourites , inline: true },
            { name: '\u200B', value: '\u200B' , inline: true },
            { name: '\u200B', value: '\u200B' , inline: true },
        )
        //Second Row
        .addFields(
            { name: 'Age', value: characterAge , inline: true },
            { name: 'BirthDay', value: characterBirthDay , inline: true },
            { name: '\u200B', value: '\u200B' , inline: true },
        )
        //Third Row
        .addFields(
            { name: 'Gender', value: characterGender , inline: true },
            { name: '\u200B', value: '\u200B' , inline: true },
            { name: '\u200B', value: '\u200B' , inline: true },
        )

        .setTimestamp()
        .setFooter({ text: 'Powered by Anilist.co', iconURL: 'https://anilist.co/img/icons/android-chrome-512x512.png' });

    //Set characterEmbed as object then return object
    const embed = { embeds: [characterEmbed] }
    return embed
}
//Handle errors
function handleError(error) {
    console.log('Error, check console');
    console.error(error);
    //returns text to reply with an error
    return 'Character Not Found...'
}

//Discord slash command for character
module.exports = {
	data: new SlashCommandBuilder()
		.setName('character')
		.setDescription('Gets anime character information by name.')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Character name.')),
	async execute(interaction) {
        const characterName = interaction.options.getString('name');
        fetchData(characterName)
            .then(data => interaction.reply(data))
	},
};
