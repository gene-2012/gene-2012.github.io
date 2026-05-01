function $(idName) {
    return document.getElementById(idName);
}

function create_blog_list_elem(title, date, file) {
    let blog_elem = document.createElement("div");
    blog_elem.className = "blog-elem";
    blog_elem.innerHTML = `<span class="date">${date}</span> <a href="blog.html?blog=${file}">${title}</a>`;
    return blog_elem;
}

async function load_blogs() {
    try {
        const response = await fetch('articles/articles.json');
        const data = await response.json();
        const blogs_list_elem = $("blog-list");
        const articles = data['articles'];
        if (!articles || articles.length === 0) {
            console.log("No articles found.");
            return;
        }
        blogs_list_elem.innerHTML = "";
        let i = 0;
        for (const blog of articles) {
            blogs_list_elem.appendChild(
                create_blog_list_elem(blog['title'], blog['date'], blog['file'])
            );
            if (i != articles.length - 1) {
                blogs_list_elem.appendChild(document.createElement("hr"));
            }
        }
    } catch (error) {
        console.error("Failed loading blog list:", error);
    }
}

function parse_url_query(url, key) {
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);
    return params.get(key);
}

function parseFrontMatter(text) {
    const regex = /^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/;
    const match = text.match(regex);
    
    if (match) {
        const yamlRaw = match[1];
        const content = match[2];
        const data = {};
        
        // Simple line-by-line parsing for key: value
        yamlRaw.split('\n').forEach(line => {
            const [key, ...valParts] = line.split(':');
            if (key && valParts.length > 0) {
                data[key.trim()] = valParts.join(':').trim();
            }
        });
        
        return { data, content };
    }
    
    return { data: {}, content: text };
}

async function load_blog_detail() {
    const cur_url = window.location.href;
    const blog_file = parse_url_query(cur_url, 'blog');
    
    if (!blog_file) {
        $('md-content').innerHTML = "<p>No blog specified.</p>";
        return;
    }

    try {
        const response = await fetch(`articles/${blog_file}`);
        if (!response.ok) throw new Error("File not found");
        
        const rawText = await response.text();

        // 1. Separate Front Matter from Content
        const { data, content } = parseFrontMatter(rawText);

        // 2. Use Metadata (Title, Date, Tags)
        // If Markdown has a title, use it; otherwise fallback to filename
        const displayTitle = data.title || blog_file.replace('.md', '');
        const displayDate = data.date || "";
        const displayTags = data.tags ? ` ${data.tags}` : "";

        // 3. Update UI
        $('headers').innerHTML = `<h2>${displayTitle}</h2>
                                  <p style="color:#888; font-size:0.9em; margin-top:-10px;">
                                  ${displayDate} ${displayTags}
                                  </p><hr />`;
        
        $('md-text').value = content;
        
        // 4. Render only the content part
        $('md-content').innerHTML = marked.parse(content);

        // Update browser tab title
        document.title = displayTitle + " - Gene Luo";

    } catch (error) {
        console.error("Error loading blog:", error);
        $('md-content').innerHTML = "<p>Failed to load blog content. Check if the file exists.</p>";
    }
}