import fs from 'node:fs';
import chalk from 'chalk';
import path from 'node:path';
import ExcelJS from 'exceljs';
import minimist from 'minimist';
import { v7 as uuid } from 'uuid';
import getID from './api/getID.js';
import getspinfos from './api/getSPInfos.js';
import getCategory from './api/getCategory.js';

const showHelp = () => {
	const help = [
		'使用：ipctc <input.txt 位置> <分类系统> <可选输出位置>',
		'',
		'示例：',
		'\t ipctc 被子植物分类系统 /path/input.txt',
		'\t ipctc 被子植物分类系统 /path/input.txt /path/output.xlsx',
	];
	console.log(chalk.blueBright(help.join('\n')));
};

const args = minimist(process.argv.slice(2));

if (args._.length === 0) {
	showHelp();
	process.exit(1);
} else if (args.h || args.help) {
	showHelp();
	process.exit(0);
} else if (args._.length < 2) {
	console.error(chalk.red('缺少参数！'));
	showHelp();
	process.exit(1);
} else if (!fs.existsSync(args._[0])) {
	console.log(chalk.red(`找不到“${args._[0]}”文件！`));
	process.exit(1);
}

const workbook = new ExcelJS.Workbook();
const worksheet = workbook.addWorksheet('分类信息');
worksheet.mergeCells('A1:B1');
worksheet.getCell('A1').value = args._[1];

const input = fs
	.readFileSync(args._[0], 'utf-8')
	.split('\n') // 分割每一行
	.map(line => line.trim()) // 去除每一行的空格
	.filter(line => line !== ''); // 过滤掉空行

for (const line of input) {
	try {
		const id = await getID(line);
		if (!id) {
			console.log(chalk.red(`找不到“${line}”的ID！`));
			continue;
		}

		const spinfos = await getspinfos(id);
		if (!spinfos) {
			console.log(chalk.red(`找不到“${line}”，ID为“${id}”的分类信息！`));
			continue;
		}

		const category = getCategory(spinfos, args._[1]);
		if (!category) {
			console.log(chalk.red(`找不到“${line}”，ID为“${id}”的分类信息！`));
			continue;
		}

		worksheet.addRow([line, ...category]);
		console.log(chalk.greenBright(`获取“${line}”，ID为“${id}”的分类信息完成！`));
	} catch (error) {
		console.error(chalk.red(`处理“${line}”时出现错误：${error.message}`));
	}
}

// 设置所有单元格的对齐方式为上下左右居中
worksheet.eachRow(row => {
	row.eachCell(cell => {
		cell.alignment = { vertical: 'middle', horizontal: 'center' };
	});
});

try {
	if (args._[2]) {
		await workbook.xlsx.writeFile(args._[2]);
	} else {
		await workbook.xlsx.writeFile(path.resolve(`${args._[0]}.xlsx`));
	}
} catch (error) {
	const savePath = args._[2] ? `${args._[2]}.${uuid()}.xlsx` : `${args._[0]}.${uuid()}.xlsx`;

	console.error(
		chalk.red(
			[
				'写入文件时出现错误：',
				error.message,
				'', //
				`文件将保存到“${savePath}”！`,
			].join('\n'),
		),
	);

	await workbook.xlsx.writeFile(savePath);
}
