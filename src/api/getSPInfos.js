import axios from 'axios';

export default async id => {
	const url = `http://www.iplant.cn/ashx/getspinfos.ashx?spid=${id}&type=classsys`;

	const response = await axios.get(url);
	if (response.status !== 200 || !response.data.classsys) return null;

	return response.data.classsys;
};
