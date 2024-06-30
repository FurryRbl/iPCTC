import { load as cheerio } from 'cheerio';

export default (List, CategorySystem) => {
	if (!List || !List.length || !CategorySystem) return null;

	const matchingString = List.find(str => str.includes(CategorySystem));

	if (!matchingString) return null;

	const $ = cheerio(matchingString);
	const links = $('a')
		.toArray()
		.map(link => $(link).text())
		.reverse();

	return links;
};
