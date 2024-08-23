import { uniqueNamesGenerator, adjectives, colors, animals, NumberDictionary, starWars, languages, countries, names } from 'unique-names-generator';


const shortName = uniqueNamesGenerator({
    dictionaries: [adjectives, animals, colors], // colors can be omitted here as not used
    length: 2
}); // big-donkey

export const NameGen = ()=>{
    const randomName = uniqueNamesGenerator({ dictionaries: [adjectives, colors, animals, NumberDictionary, starWars, languages, countries, names] }); // big_red_donkey
    return randomName
}