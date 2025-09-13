document.addEventListener('DOMContentLoaded', () => {
    const select = document.getElementById('tab-select')
    if (select) {
        select.addEventListener('change', e => {
            const idx = parseInt(e.target.value, 10)
            if (!Number.isNaN(idx)) showTab(idx)
        })
        // Show first tab by default
        showTab(0)
    }
})

function showTab(index) {
    const tabs = document.querySelectorAll('.tab')
    tabs.forEach((tab, i) => {
        tab.style.display = i === index ? 'block' : 'none'
    })

    // keep dropdown in sync
    const select = document.getElementById('tab-select')
    if (select && select.value !== String(index)) {
        select.value = String(index)
    }
}
