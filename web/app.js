'use strict';
const form = document.querySelector('#config'), $ = s => document.querySelector(s);
const fmt = n => n.toLocaleString('pt-BR');
let worker, result, urls = [];
const numeric = ['clientes', 'produtos', 'vendedores', 'vendas', 'itens', 'seed', 'missingEmail', 'invalidEmail', 'earlySales', 'emptySales'];
function config() { const c = Object.fromEntries(new FormData(form)); for (const k of numeric) c[k] = Number(c[k]); c.dirty = $('#dirty').checked; return c; }
function qualitySummary() { const c = config(); $('#quality-summary').textContent = `${fmt(Math.floor(c.clientes * c.missingEmail / 100))} e-mails ausentes · ${fmt(Math.floor(c.clientes * c.invalidEmail / 100))} inválidos · ${fmt(Math.floor(c.vendas * c.earlySales / 100))} vendas antes do cadastro · ${fmt(Math.floor(c.vendas * c.emptySales / 100))} pedidos sem itens.`; }
function changed() { $('#quality').hidden = !$('#dirty').checked; form.querySelectorAll('input[type=range]').forEach(i => { form.querySelector(`output[for=${i.id}]`).textContent = i.value + '%'; }); qualitySummary(); if (result) $('#stale').hidden = false; }
form.addEventListener('input', e => { changed(); if (['clientes','produtos','vendedores','vendas','itens'].includes(e.target.name)) document.querySelectorAll('[data-preset]').forEach(b => b.classList.remove('selected')); });
const presets = { small: [1000,150,13,2000,6000], portfolio: [10185,450,13,10357,25463], large: [30000,450,30,50000,100000] };
document.querySelectorAll('[data-preset]').forEach(b => b.onclick = () => { Object.keys(Fakedata.limits).forEach((k,i) => form.elements[k].value = presets[b.dataset.preset][i]); document.querySelectorAll('[data-preset]').forEach(x => x.classList.toggle('selected', x === b)); changed(); });
function busy(value) { form.querySelectorAll('input, select, button').forEach(e => e.disabled = value); $('#cancel').disabled = false; $('#cancel').hidden = !value; $('#progress').hidden = !value; }
function stop(message) { worker?.terminate(); worker = null; busy(false); $('#status-text').textContent = message; }
$('#cancel').onclick = () => stop('Geração cancelada. Ajuste os parâmetros e tente novamente.');
function url(content, type) { const u = URL.createObjectURL(new Blob([content], { type })); urls.push(u); return u; }
function preview(key) {
  const p = result.preview[key], table = $('#preview'); table.replaceChildren();
  const head = table.createTHead().insertRow(); for (const col of p.columns) { const th = document.createElement('th'); th.scope = 'col'; th.textContent = col; head.append(th); }
  const body = table.createTBody(); p.rows.forEach(row => { const tr = body.insertRow(); row.forEach(value => { tr.insertCell().textContent = value === '' ? '∅' : value; }); });
  document.querySelectorAll('[role=tab]').forEach(t => { const selected = t.dataset.key === key; t.setAttribute('aria-selected', String(selected)); t.tabIndex = selected ? 0 : -1; });
  $('#table-panel').setAttribute('aria-labelledby', `tab-${key}`);
}
function render(data) {
  urls.forEach(URL.revokeObjectURL); urls = []; result = data;
  $('#download-zip').href = url(data.archive, 'application/zip');
  $('#file-list').replaceChildren(); $('#tabs').replaceChildren();
  let total = 0;
  for (const [key, p] of Object.entries(data.preview)) {
    total += p.count;
    const link = document.createElement('a'); link.download = Fakedata.filenames[key]; link.href = url(data.files[link.download], 'text/csv;charset=utf-8'); link.textContent = `${key === 'itens' ? 'Itens de venda' : key} · ${fmt(p.count)} ↓`; $('#file-list').append(link);
    const tab = document.createElement('button'); tab.type = 'button'; tab.id = `tab-${key}`; tab.dataset.key = key; tab.setAttribute('role','tab'); tab.setAttribute('aria-controls','table-panel'); tab.textContent = key === 'itens' ? 'Itens de venda' : key; tab.onclick = () => preview(key); $('#tabs').append(tab);
  }
  $('#result-meta').textContent = `${fmt(total)} linhas · 5 tabelas · semente ${data.manifest.parametros.seed} · ${(data.archive.byteLength / 1048576).toLocaleString('pt-BR', {maximumFractionDigits:1})} MB`;
  $('#result').hidden = false; $('#stale').hidden = true; preview('clientes'); $('#result').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
$('#tabs').addEventListener('keydown', e => { const tabs = [...$('#tabs').children], i = tabs.indexOf(document.activeElement); if (i < 0) return; let next; if(e.key === 'ArrowRight') next = (i+1)%tabs.length; if(e.key === 'ArrowLeft') next = (i-1+tabs.length)%tabs.length; if(e.key === 'Home') next=0; if(e.key === 'End') next=tabs.length-1; if(next !== undefined){e.preventDefault();tabs[next].click();tabs[next].focus();} });
form.addEventListener('submit', event => {
  event.preventDefault(); $('#error').hidden = true;
  try {
    const c = Fakedata.validate(config());
    if (!window.Worker) throw Error('Seu navegador não oferece suporte a Web Workers. Use uma versão atual do Chrome, Edge, Firefox ou Safari.');
    busy(true); $('#progress').value = 0; $('#status-text').textContent = 'Gerando no seu navegador…';
    worker = new Worker('worker.js');
    worker.onmessage = ({ data }) => { if(data.type === 'progress') { $('#progress').value = data.percent; $('#status-text').textContent = `${data.message}… ${data.percent}%`; } else if(data.type === 'done') { stop('Base gerada. Seus arquivos estão prontos para baixar.'); render(data); } else { stop('Não foi possível gerar.'); $('#error').textContent = data.message; $('#error').hidden = false; } };
    worker.onerror = () => { stop('Falha na geração.'); $('#error').textContent = 'Não foi possível iniciar ou concluir a geração. Acesse por HTTP/HTTPS e tente um volume menor.'; $('#error').hidden = false; };
    worker.postMessage(c);
  } catch(error) { stop('Revise a configuração.'); $('#error').textContent = error.message; $('#error').hidden = false; }
});
window.addEventListener('beforeunload', () => { worker?.terminate(); urls.forEach(URL.revokeObjectURL); });
changed();
