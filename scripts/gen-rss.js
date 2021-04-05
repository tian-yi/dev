const fs = require("fs");
const fsPromise = require("fs").promises;
const path = require("path");
const Feed = require("feed").Feed;
const matter = require("gray-matter");
const remark = require("remark");
const html = require("remark-html");
const prism = require("remark-prism");

const postsDirectory = path.join(process.cwd(), "posts");

function getSortedPostsData() {
  // Get file names under /posts
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames.map((fileName) => {
    // Remove ".md" from file name to get id
    const id = fileName.replace(/\.md$/, "");

    // Read markdown file as string
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    // Combine the data with the id
    return {
      id,
      content: matterResult.content,
      ...matterResult.data,
    };
  });
  // Sort posts by date
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

const feed = new Feed({
  title: "T-dev",
  description: "Tianyi's blog feed!",
  id: "https://tianyi.dev",
  link: "https://tianyi.dev/",
  image: "https://tianyi.dev/images/profile.jpg",
  favicon: "https://tianyi.dev/favicon.ico",
  copyright: "All rights reserved 2020, Tianyi Laferrere-Wang",
  generator: "awesome", // optional, default = 'Feed for Node.js'
  feedLinks: {
    json: "https://tianyi.dev/json",
    atom: "https://tianyi.dev/feed.xml",
  },
  author: {
    name: "Tianyi Laferrere-Wang",
    email: "hi@tianyi.dev",
    link: "https://tianyi.dev/about",
  },
});

async function generate() {
  const posts = getSortedPostsData();

  await Promise.all(
    posts.map(async (post) => {
      const processedContent = await remark()
        .use(prism)
        .use(html)
        .process(post.content);

      const contentHtml = processedContent.toString();

      feed.addItem({
        title: post.title,
        id: post.id,
        link: "https://tianyi.dev/posts/" + post.id,
        content: contentHtml,
        date: new Date(post.date),
      });
    })
  );

  await fsPromise.writeFile("./public/feed.xml", feed.atom1(), "utf-8", (e) => {
    console.log("failed to write" + e);
  });
  await fsPromise.writeFile("./public/feed.json", feed.json1(), "utf-8", () => {
    console.log("failed to write");
  });
}

generate();
