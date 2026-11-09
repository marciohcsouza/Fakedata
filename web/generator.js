/* Shared by the browser worker and Node tests. No external dependencies. */
(function (root) {
  'use strict';
  const VERSION = '1.1.0';
  const defaults = { clientes: 1000, produtos: 150, vendedores: 13, vendas: 2000, itens: 6000, seed: 42,
    inicio: '2024-01-01', fim: '2025-06-30', delimiter: ',', dirty: false,
    missingEmail: 5, invalidEmail: 15, earlySales: 10, emptySales: 10 };
  const limits = { clientes: 100000, produtos: 10000, vendedores: 10000, vendas: 100000, itens: 300000 };
  const schema = {
    clientes: ['id_cliente', 'nome', 'estado', 'data_nascimento', 'data_cadastro', 'email'],
    produtos: ['id_produto', 'nome_produto', 'marca', 'preco'],
    vendedores: ['id_vendedor', 'nome', 'estado', 'situacao_cadastro', 'Loja'],
    vendas: ['id_venda', 'id_cliente', 'id_vendedor', 'data_venda', 'canal_venda'],
    itens: ['id_item_venda', 'id_venda', 'id_produto', 'quantidade', 'valor_unitario_na_venda', 'valor_total_item']
  };
  const filenames = { clientes: 'clientesfake.csv', produtos: 'produtosfake.csv', vendedores: 'vendedoresfake.csv', vendas: 'vendasfake.csv', itens: 'itens_venda_fake.csv' };
  const day = s => Date.parse(s + 'T00:00:00Z') / 86400000;
  const iso = n => new Date(n * 86400000).toISOString().slice(0, 10);
  function validate(input) {
    const c = { ...defaults, ...input };
    for (const [key, max] of Object.entries(limits)) if (!Number.isInteger(c[key]) || c[key] < 1 || c[key] > max) throw Error(`${key}: informe um inteiro entre 1 e ${max.toLocaleString('pt-BR')}.`);
    if (!Number.isInteger(c.seed) || c.seed < 0 || c.seed > 4294967295) throw Error('Semente: use um inteiro entre 0 e 4294967295.');
    for (const key of ['inicio', 'fim']) if (!/^\d{4}-\d{2}-\d{2}$/.test(c[key]) || !Number.isFinite(day(c[key])) || iso(day(c[key])) !== c[key] || c[key] < '2000-01-01' || c[key] > '2100-12-31') throw Error('Use datas válidas entre 2000 e 2100.');
    if (day(c.fim) - day(c.inicio) < 2) throw Error('O período deve ter pelo menos três dias.');
    if (![',', ';'].includes(c.delimiter)) throw Error('Separador inválido.');
    for (const key of ['missingEmail', 'invalidEmail', 'earlySales', 'emptySales']) if (!Number.isFinite(c[key]) || c[key] < 0 || c[key] > 100) throw Error('Os percentuais devem estar entre 0 e 100.');
    if (c.dirty && c.missingEmail + c.invalidEmail > 100) throw Error('E-mails ausentes + inválidos não podem ultrapassar 100%.');
    const empty = c.dirty ? Math.floor(c.vendas * c.emptySales / 100) : 0;
    const covered = c.vendas - empty;
    if (!covered) throw Error('Reserve pelo menos uma venda com itens.');
    if (c.itens < covered) throw Error(`Para esse percentual de pedidos sem itens, gere pelo menos ${covered} itens.`);
    return c;
  }
  function generate(input, progress = () => {}) {
    const c = validate(input);
    let state = c.seed >>> 0;
    const random = () => { state = (state + 0x6D2B79F5) >>> 0; let t = Math.imul(state ^ state >>> 15, 1 | state); t ^= t + Math.imul(t ^ t >>> 7, 61 | t); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    const int = (a, b) => a + Math.floor(random() * (b - a + 1));
    const pick = a => a[int(0, a.length - 1)];
    const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = int(0, i); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    const indices = n => shuffle(Array.from({ length: n }, (_, i) => i));
    const first = ['Ana', 'João', 'Márcio', 'Beatriz', 'Lucas', 'Camila', 'Pedro', 'Luísa', 'Rafael', 'Isabela', 'André', 'Júlia', 'Bruno', 'Letícia', 'Diego', 'Mariana', 'José', 'Vitória', 'Carlos', 'Fernanda'];
    const last = ['Souza', 'Silva', 'Oliveira', 'Santos', 'Costa', 'Pereira', 'Almeida', 'Lima', 'Rodrigues', 'Gomes', 'Carvalho', 'Ribeiro', 'Martins', 'Araújo', 'Barbosa'];
    const name = () => `${pick(first)} ${pick(last)} ${pick(last)}`;
    const states = ['MT', 'SP', 'RJ', 'PR', 'SC'];
    const start = day(c.inicio), end = day(c.fim), registrationEnd = start + Math.max(1, Math.floor((end - start) * .3));
    const data = { clientes: [], produtos: [], vendedores: [], vendas: [], itens: [] };
    const missing = c.dirty ? Math.floor(c.clientes * c.missingEmail / 100) : 0;
    const invalid = c.dirty ? Math.floor(c.clientes * c.invalidEmail / 100) : 0;
    const emailOrder = indices(c.clientes), emailTypes = new Uint8Array(c.clientes);
    emailOrder.slice(0, missing).forEach(i => emailTypes[i] = 1);
    emailOrder.slice(missing, missing + invalid).forEach(i => emailTypes[i] = 2);
    const emailDomains = ['gmail.com', 'hotmail.com', 'outlook.com', 'terra.com', 'bol.com', 'icloud.com'];
    for (let i = 1; i <= c.clientes; i++) {
      const fullName = name();
      const client = [i, fullName, pick(states), iso(int(day('1960-01-01'), day('1999-12-31'))), iso(int(start + 1, registrationEnd))];
      const parts = fullName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().split(' ');
      const username = `${parts[0]}.${parts[parts.length - 1]}${i}`;
      // Separate deterministic stream keeps quality settings from changing other tables.
      const domain = emailDomains[((Math.imul(i, 2654435761) ^ c.seed) >>> 0) % emailDomains.length];
      const email = emailTypes[i - 1] === 1 ? '' : emailTypes[i - 1] === 2 ? `${username}.email.invalido` : `${username}@${domain}`;
      data.clientes.push([...client, email]);
    }
    progress(15, 'Clientes gerados');
    const types = ['Teclado', 'Mouse', 'Monitor', 'Headset', 'Microfone', 'HD', 'SSD 1TB', 'Placa mãe', 'Memória RAM 8GB', 'Cooler Fan', 'Gabinete', 'Processador', 'Placa de Vídeo', 'Webcam', 'Fonte 650w'];
    const brands = ['InnoSphere', 'TechNova', 'ByteCore'], ranges = [[50000, 500000], [20000, 250000], [5000, 150000]];
    const cents = [];
    for (let i = 0; i < c.produtos; i++) { const b = i % 3; const price = int(...ranges[b]); cents.push(price); data.produtos.push([i + 1, `${types[Math.floor(i / 3) % 15]} Modelo ${String(Math.floor(i / 45) + 1).padStart(2, '0')}`, brands[b], (price / 100).toFixed(2)]); }
    const active = new Set(indices(c.vendedores).slice(0, Math.floor(c.vendedores * .55)));
    for (let i = 0; i < c.vendedores; i++) { const uf = pick(states); data.vendedores.push([i + 1, name(), uf, active.has(i) ? 1 : 0, `Filial ${uf}`]); }
    progress(25, 'Produtos e vendedores gerados');
    const earlyCount = c.dirty ? Math.floor(c.vendas * c.earlySales / 100) : 0;
    const early = new Set(indices(c.vendas).slice(0, earlyCount));
    for (let i = 0; i < c.vendas; i++) { const client = pick(data.clientes); const registered = day(client[4]); data.vendas.push([i + 1, client[0], int(1, c.vendedores), iso(early.has(i) ? int(start, registered - 1) : int(registered, end)), pick(['Site', 'Linktree', 'Landing Page'])]); }
    progress(45, 'Vendas geradas');
    const emptyCount = c.dirty ? Math.floor(c.vendas * c.emptySales / 100) : 0;
    const saleIds = indices(c.vendas).slice(emptyCount).map(i => i + 1);
    for (let i = 0; i < c.itens; i++) {
      const saleId = i < saleIds.length ? saleIds[i] : pick(saleIds), p = int(0, c.produtos - 1), qty = int(1, 3);
      data.itens.push([i + 1, saleId, p + 1, qty, (cents[p] / 100).toFixed(2), (qty * cents[p] / 100).toFixed(2)]);
      if (i % 10000 === 0) progress(45 + Math.floor(i / c.itens * 35), 'Itens de venda');
    }
    const escape = value => { const s = String(value); return s.includes(c.delimiter) || /["\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
    const files = {}, preview = {};
    for (const key of Object.keys(schema)) { files[filenames[key]] = '\uFEFF' + [schema[key], ...data[key]].map(row => row.map(escape).join(c.delimiter)).join('\r\n') + '\r\n'; preview[key] = { columns: schema[key], rows: data[key].slice(0, 5), count: data[key].length }; }
    const manifest = { gerador: 'Fakedata Web', versao: VERSION, parametros: c, ocorrencias: { emails_ausentes: missing, emails_invalidos: invalid, vendas_antes_cadastro: earlyCount, vendas_sem_itens: emptyCount }, observacoes: ['Dados sintéticos, sem representatividade estatística.', 'Algoritmo JavaScript independente: mesma semente não reproduz o Faker Python.', 'Percentuais arredondados para baixo. Categorias de vendas podem se sobrepor.', 'E-mails sintéticos com domínios variados e sintaxe válida; não há verificação de existência das caixas. Inválidos têm sintaxe inválida.', 'Situação do vendedor representa cadastro atual e não restringe vendas históricas.'] };
    files['parametros.json'] = JSON.stringify(manifest, null, 2);
    files['dicionario.json'] = JSON.stringify({ tabelas: schema, relacionamentos: ['vendas.id_cliente → clientes.id_cliente', 'vendas.id_vendedor → vendedores.id_vendedor', 'itens_venda.id_venda → vendas.id_venda', 'itens_venda.id_produto → produtos.id_produto'], formatos: { datas: 'YYYY-MM-DD', valores: 'Decimal com ponto; BRL', csv: 'UTF-8 com BOM, CRLF e separador configurável', situacao_cadastro: '0 = inativo; 1 = ativo' } }, null, 2);
    progress(90, 'Preparando downloads');
    return { files, preview, manifest };
  }
  // ZIP STORE (without compression): small implementation, offline and reproducible.
  function zip(files) {
    const encoder = new TextEncoder(), chunks = [], central = []; let offset = 0;
    const table = Array.from({ length: 256 }, (_, n) => { for (let k = 0; k < 8; k++) n = n & 1 ? 0xEDB88320 ^ n >>> 1 : n >>> 1; return n >>> 0; });
    for (const [filename, content] of Object.entries(files)) {
      const name = encoder.encode(filename), bytes = encoder.encode(content); let crc = 0xFFFFFFFF;
      for (const b of bytes) crc = table[(crc ^ b) & 255] ^ crc >>> 8;
      crc = (crc ^ 0xFFFFFFFF) >>> 0;
      const h = new Uint8Array(30 + name.length), v = new DataView(h.buffer);
      v.setUint32(0, 0x04034b50, true); v.setUint16(4, 20, true); v.setUint16(6, 0x800, true); v.setUint16(12, 33, true);
      v.setUint32(14, crc, true); v.setUint32(18, bytes.length, true); v.setUint32(22, bytes.length, true); v.setUint16(26, name.length, true); h.set(name, 30);
      const ch = new Uint8Array(46 + name.length), cv = new DataView(ch.buffer);
      cv.setUint32(0, 0x02014b50, true); cv.setUint16(4, 20, true); cv.setUint16(6, 20, true); cv.setUint16(8, 0x800, true); cv.setUint16(14, 33, true);
      cv.setUint32(16, crc, true); cv.setUint32(20, bytes.length, true); cv.setUint32(24, bytes.length, true); cv.setUint16(28, name.length, true); cv.setUint32(42, offset, true); ch.set(name, 46);
      chunks.push(h, bytes); central.push(ch); offset += h.length + bytes.length;
    }
    const size = central.reduce((n, a) => n + a.length, 0), end = new Uint8Array(22), ev = new DataView(end.buffer);
    ev.setUint32(0, 0x06054b50, true); ev.setUint16(8, central.length, true); ev.setUint16(10, central.length, true); ev.setUint32(12, size, true); ev.setUint32(16, offset, true);
    const result = new Uint8Array(offset + size + 22); let pos = 0;
    for (const a of [...chunks, ...central, end]) { result.set(a, pos); pos += a.length; }
    return result;
  }
  const api = { VERSION, defaults, limits, schema, filenames, validate, generate, zip };
  if (typeof module !== 'undefined') module.exports = api; else root.Fakedata = api;
})(globalThis);
