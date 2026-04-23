let wordCount;
let words;
let paragraphs;

async function fetchData() {
    try {
        const [wordCountRes, paraRes] = await Promise.all([
            fetch('./../../interactive_book_word_count.json'),
            fetch('./../../interactive_book_parapragh_texts.json')
        ]);
        
        if (!wordCountRes.ok || !paraRes.ok) throw new Error("Failed to fetch data");
        
        wordCount = await wordCountRes.json();
        paragraphs = await paraRes.json();

        words = Object.keys(wordCount).map(word => ({
            text: word,
            count: wordCount[word],
            size: wordCount[word]
        }));
    } catch (error) {
        console.error('Error fetching JSON:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchData().then(createWordCloud);
    
    document.getElementById('close-snippet').onclick = () => {
        document.getElementById('snippet-container').classList.add('hidden');
    };
});

function createWordCloud() {
    const wrapper = document.getElementById('word-cloud-wrapper');
    const width = wrapper.offsetWidth;
    const height = wrapper.offsetHeight;

    const minCount = Math.min(...Object.values(wordCount));
    const maxCount = Math.max(...Object.values(wordCount));

    const side = Math.sqrt(width * height);
    const scaleSize = d3.scaleLinear()
        .domain([minCount, maxCount])
        .range([20 / 1000 * side, 100 / 1000 * side]);

    const tooltip = d3.select("#tooltip");

    const layout = d3.layout.cloud()
        .size([width, height])
        .words(words)
        .padding(10)
        .rotate(() => (Math.random() > 0.5 ? 0 : 90))
        .font("Outfit")
        .fontSize(d => scaleSize(d.size))
        .on("end", draw);

    layout.start();

    function draw(words) {
        const svg = d3.select("#word-cloud")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${width / 2},${height / 2})`);

        const textElements = svg.selectAll("text")
            .data(words)
            .enter()
            .append("text")
            .style("font-family", "Outfit")
            .style("font-weight", "500")
            .style("fill", (d, i) => d3.interpolateCool(i / words.length))
            .style("cursor", "pointer")
            .attr("text-anchor", "middle")
            .attr("transform", d => `translate(${d.x},${d.y})rotate(${d.rotate})`)
            .style("font-size", d => `${d.size}px`)
            .text(d => d.text);

        textElements
            .on("mouseover", function (d) {
                d3.select(this)
                    .transition().duration(200)
                    .style("fill", "#f59e0b")
                    .style("filter", "drop-shadow(0 0 8px rgba(245, 158, 11, 0.5))");

                tooltip.style("opacity", 1)
                    .html(`<strong>${d.text}</strong><br>${d.count} occurrences`);
            })
            .on("mousemove", function () {
                tooltip.style("left", `${d3.event.pageX + 15}px`)
                    .style("top", `${d3.event.pageY + 15}px`);
            })
            .on("mouseout", function (d, i) {
                d3.select(this)
                    .transition().duration(200)
                    .style("fill", d3.interpolateCool(i / words.length))
                    .style("filter", "none");
                tooltip.style("opacity", 0);
            })
            .on("click", function(d) {
                showSnippet(d.text);
            });
    }
}

function showSnippet(word) {
    const container = document.getElementById('snippet-container');
    const title = document.getElementById('selected-word-title');
    const content = document.getElementById('snippet-content');
    
    // Find a paragraph containing the word
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    const relevantParas = paragraphs.filter(p => regex.test(p));
    
    title.textContent = word;
    container.classList.remove('hidden');
    
    if (relevantParas.length > 0) {
        // Show first match but highlight the word
        const snippet = relevantParas[0].replace(regex, match => `<b>${match}</b>`);
        content.innerHTML = `"...${snippet}..."`;
    } else {
        content.textContent = "No direct context found in paragraphs.";
    }
}

window.addEventListener('resize', () => {
    d3.select("#word-cloud svg").remove();
    createWordCloud();
});
