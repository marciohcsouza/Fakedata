const { test } = require('node:test');
const assert = require('node:assert/strict');
const F = require('../web/generator.js');
const base = { clientes: 100, produtos: 17, vendedores: 7, vendas: 100, itens: 300 };
const rows = (r, key) => r.files[F.filenames[key]].slice(1).trim().split('\r\n').slice(1).map(s => s.split(','));
test('default emails use varied domains and normalized names with unique IDs', () => {
  const r = F.generate(base), clients = rows(r, 'clientes');
  const domains = new Set(clients.map(c => c[5].split('@')[1]));
  assert.equal(domains.size, 6);
  assert.equal(new Set(clients.map(c => c[5])).size, base.clientes);
  for (const c of clients) {
    const names = c[1].normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().split(' ');
    assert.ok(c[5].startsWith(`${names[0]}.${names[names.length - 1]}${c[0]}@`));
    assert.match(c[5], /^[a-z]+\.[a-z]+\d+@(gmail|hotmail|outlook|terra|bol|icloud)\.com$/);
  }
  assert.equal(r.manifest.ocorrencias.emails_ausentes, 0);
  assert.equal(r.manifest.ocorrencias.emails_invalidos, 0);
});
test('determinism, schema, exact counts and foreign keys', () => {
  const a = F.generate(base), b = F.generate(base);
  assert.deepEqual(a.files, b.files);
  assert.notEqual(a.files['clientesfake.csv'], F.generate({...base, seed:43}).files['clientesfake.csv']);
  for (const [k, n] of Object.entries(base)) { assert.equal(rows(a,k).length,n); assert.equal(a.files[F.filenames[k]].slice(1).split('\r\n')[0],F.schema[k].join(',')); }
  const clients = rows(a,'clientes'), sales = rows(a,'vendas'), items = rows(a,'itens');
  for (const sale of sales) { assert.ok(+sale[1]>=1 && +sale[1]<=100); assert.ok(+sale[2]>=1 && +sale[2]<=7); assert.ok(sale[3]>=clients[+sale[1]-1][4]); assert.ok(sale[3]<='2025-06-30'); }
  assert.equal(new Set(items.map(i=>i[1])).size,100);
  const products = rows(a,'produtos');
  for (const item of items) { assert.ok(+item[1]>=1&&+item[1]<=100); assert.ok(+item[2]>=1&&+item[2]<=17); assert.equal(item[4],products[+item[2]-1][3]); assert.equal(Math.round(+item[5]*100),Math.round(+item[4]*100)*+item[3]); }
});
test('configurable quality has exact disjoint email counts and exact sale counts', () => {
  for (const percent of [0, 1, 37, 99]) {
    const a = F.generate({...base, dirty:true, missingEmail:percent, invalidEmail:100-percent, earlySales:percent, emptySales:percent});
    const clients = rows(a,'clientes'), sales = rows(a,'vendas'), items = rows(a,'itens');
    assert.equal(clients.filter(c=>!c[5]).length,percent);
    assert.equal(clients.filter(c=>c[5].endsWith('.invalido')).length,100-percent);
    assert.equal(sales.filter(s=>s[3]<clients[+s[1]-1][4]).length,percent);
    assert.equal(100-new Set(items.map(i=>i[1])).size,percent);
    assert.deepEqual(a.manifest.ocorrencias,{emails_ausentes:percent,emails_invalidos:100-percent,vendas_antes_cadastro:percent,vendas_sem_itens:percent});
  }
});
test('validation rejects impossible requests and dates', () => {
  for(const config of [{clientes:0},{vendas:1.5},{itens:1},{dirty:true,missingEmail:90,invalidEmail:20},{dirty:true,emptySales:100},{inicio:'2024-02-30'},{fim:'2023-01-01'},{seed:-1},{delimiter:'|'}]) assert.throws(()=>F.generate({...base,...config}));
});
test('minimum date interval and singleton dimensions', () => {
  const a=F.generate({clientes:1,produtos:1,vendedores:1,vendas:1,itens:1,inicio:'2024-01-01',fim:'2024-01-03',dirty:true,earlySales:100,missingEmail:0,invalidEmail:0,emptySales:0});
  assert.equal(rows(a,'clientes')[0][4],'2024-01-02'); assert.equal(rows(a,'vendas')[0][3],'2024-01-01');
});
test('CSV semicolon and UTF-8 ZIP signature', () => {
  const a=F.generate({...base,delimiter:';'});
  assert.ok(a.files['clientesfake.csv'].startsWith('\uFEFFid_cliente;'));
  const z=F.zip(a.files); assert.equal(new DataView(z.buffer).getUint32(0,true),0x04034b50);
});
