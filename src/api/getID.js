import axios from 'axios';
import { load as cheerio } from 'cheerio';

const getID = async name => {
	const url = `http://www.iplant.cn/info/${name}`;

	const response = await axios.get(url);
	if (response.status !== 200) return null;

	const $ = cheerio(response.data);

	// 处理俗名
	if ($('#sptitlel').text().length === 0 && response.data.includes('您是否要找：')) {
		let href = $('.infomore .spantxt a')?.attr('href');
		if (href && href.includes('/info/')) {
			href = href.slice(6);
			return await getID(href);
		}
	}

	// 获取 spno 值
	let spno = null;
	$('script').each((index, element) => {
		const scriptContent = $(element).html();
		const match = scriptContent.match(/var\s+spno\s*=\s*"([^"]+)";/);
		if (match) {
			spno = match[1];
			return false;
		}
	});

	return spno;
};

export default getID;
