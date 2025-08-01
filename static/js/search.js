// 从URL获取搜索参数并显示在页面上
function getSearchQuery() {
    // 创建URLSearchParams对象来解析查询参数
    const urlParams = new URLSearchParams(window.location.search);
    // 获取q参数的值
    const query = urlParams.get('q');
    
    // 在页面上显示搜索查询
    const queryElement = document.getElementById('search-query');
    if (query) {
        queryElement.textContent = query;
        // 显示搜索结果
        showSearchResults(query);
    } else {
        queryElement.textContent = 'Nothing specified';
        document.querySelector('h2').textContent = 'No search query provided';
    }
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function setCookie(name, value, minutes) {
    const expires = new Date();
    expires.setTime(expires.getTime() + minutes * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

async function fetchData() { 
    // Fetch from /book_detail.json
    // Check last_update cookie
    const lastUpdate = getCookie('last_update');
    const nowStamp = Date.now();
    let localStorageData = localStorage.getItem('book_detail');
    if (nowStamp - lastUpdate <= 10 * 60 * 1000 && localStorageData) {
        return JSON.parse(localStorageData);
    }
    const response = await fetch('book_detail.json');
    const data = await response.json();
    localStorage.setItem('book_detail', JSON.stringify(data));
    setCookie('last_update', nowStamp, 10);
    return data;
}

// 显示搜索结果的函数
async function showSearchResults(query) {
    const appElement = document.querySelector('.app');
    const searchResults = await fetchData();
    
    // 筛选与查询匹配的结果（匹配标题、作者和标签）
    const filteredResults = searchResults.filter(book => 
        book.title.toLowerCase().includes(query.toLowerCase()) ||
        book.author.toLowerCase().includes(query.toLowerCase()) ||
        (book.tags && book.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())))
    );
    
    // 生成搜索结果HTML
    if (filteredResults.length > 0) {
        let resultsHTML = `<h3>Search Results (${filteredResults.length} found)</h3>`;
        resultsHTML += '<div class="search-results">';
        
        filteredResults.forEach(book => {
            // 处理标签显示
            let tagsHTML = '';
            if (book.tags && book.tags.length > 0) {
                tagsHTML = `<p><strong>Tags:</strong> ${book.tags.join(', ')}</p>`;
            }
            
            resultsHTML += `
                <div class="document-card">
                    <h2>${book.title}</h2>
                    <p><strong>Author:</strong> ${book.author}</p>
                    <p>${book.description}</p>
                    <p><strong>Year:</strong> ${book.year}</p>
                    ${tagsHTML}
                    <button class="btn" onclick="window.location.href='books/${book.filename}'">View Details</button>
                </div>
            `;
        });
        
        resultsHTML += '</div>';
        appElement.innerHTML = resultsHTML;
    } else {
        appElement.innerHTML = `
            <div class="document-card">
                <h2>No Results Found</h2>
                <p>Your search for "${query}" did not match any documents in our library.</p>
                <p>Suggestions:</p>
                <ul>
                    <li>Make sure all words are spelled correctly.</li>
                    <li>Try different keywords.</li>
                    <li>Try more general keywords.</li>
                </ul>
            </div>
        `;
    }
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    getSearchQuery();
});