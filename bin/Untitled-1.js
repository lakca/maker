void function() {
  const title = document
  .querySelectorAll('table.infobox')[0]
  .innerText.trim()
  const url = window.location.href
  console.log(`[${title}](${url})`);
}();