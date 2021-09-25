// noinspection HtmlRequiredLangAttribute
const replacements: [string | RegExp, string][] = [
	["<html>", `<html lang="en">`],
	[/<head>.*<title>/s, "<head>\n\t<title>"],
	[/<title>.*<\/title>/s, "<title>Cookie Kiln - Testing</title>"],
	["img/favicon.ico", "/favicon.ico"],
	[/^.*?src="showads.js".*?\n/m, ""],
	[/^.*?script.*?adsbygoogle.*?\n/m, ""],
	[/<script>.*?\(adsbygoogle.*?<\/script>.*?\n/s, ""],
	[/<!--\[if (?:lt IE[0-9]|IE)]>.*?<!\[endif]-->\n/gs, ""],
	[/<!-- Facebook Pixel Code -->.*?<!-- end code -->/gs, ""],
	[/^\s*<!--\n\s+<div id="donateBox">.*?<\/div>.*?-->\n/ms, ""],
	[/^\s*<div class="ifNoAds".*?>.*?<\/div>\n/ms, ""],
	[
		/^\s*<div id="smallSupport".*?>.*?\^ Sponsored link \^<\/div>.*?<\/div>\n/ms,
		"",
	],
	[/^\s*<div id="detectAds".*?<\/div>\n/ms, ""],
	[
		/^\s*<div id="support".*?AdventureQuest Worlds.*?<\/div>.*?<\/div>.*?<\/div>.*?\n/ms,
		"",
	],
	[/url\((img\/.*?)\)/g, "url(/$1)"],
	[/"((?:snd|img)\/.*?)"/g, `"/$1"`],
	[/'((?:snd|img)\/.*?)'/g, `'/$1'`],
	[/<script src="([A-Za-z][^:]+?)"/g, `<script src="/$1"`],
	[/<link href="([A-Za-z][^:]+?)"/g, `<link href="/$1"`],
	[/0px([;, ])/g, "0$1"],
];

export async function transformIndexHtml(html: string): Promise<string> {
	let transformedHtml = html;
	for (const [from, to] of replacements) {
		transformedHtml = transformedHtml.replace(from, to);
	}
	return transformedHtml;
}
