// Mới làm mod: đọc huong-dan.md cạnh gói này trước; hàm / sự kiện / móc tra ở tai-lieu-api.md.
// File này chỉ cần khi mod muốn đổi công thức, thêm giao diện hoặc nghe biến cố trong game; chỉ thêm nội dung thì xóa file và dòng `script:` ở mod.yaml.
// Điểm vào JS của gói (tùy). Nạp trước pha boot; import được file khác trong gói (./lib/x.js) khi đã cài trong game.
// Phần dữ liệu (content/, patch, balance, img/) game tự nạp từ mod.yaml, ở đây chỉ làm việc cần code.
(window.tuTienMods ??= []).push({
  id: 'vi_du', // trùng id trong mod.yaml: game gộp boot / ready dưới đây vào cùng mod
  boot(tt, mod) {
    // Pha boot: móc, modifier, hiệu ứng / điều kiện mới, hành động. Vd. linh thạch rơi thêm 10%:
    // mod.modify('dropChance', (input) => input.value * 1.1);
    mod.log('boot, tùy chọn:', mod.options);
  },
  ready(tt, mod) {
    if (mod.options.chao) tt.ui.toast('Mod Mẫu đã nạp');
    tt.on('combatEnd', (e) => mod.log('xong trận', e));
    // Ô nhỏ trong nút nổi "Mod" (góc dưới phải); người chơi ghim ra ngoài được
    const o = mod.ui.addDock({
      id: 'tui_do',
      title: 'Túi đồ',
      mount(el, tt) {
        // All items
        const row = (...kids) => {
          const d = document.createElement('div');
          d.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:4px 0';
          d.append(...kids);
          return d;
        };
        const draw = () => {
          el.replaceChildren();
          el.append(row('Linh thạch: ', tt.ui.kit.stepper({ value: tt.state().run.nhanVat.linhThach, max: 99999999, step: 1000000, onChange: (nv) => tt.state().run.nhanVat.linhThach = nv })));
          el.append(row('Vật: ', tt.ui.kit.button({text: 'Mở túi đồ', kind: 'nho', onClick: () => mod.ui.openPanel('kit_tui_do')})));
        };
        draw();
        return tt.subscribe(draw); // hàm hủy theo dõi = hàm dọn
      },
    });
    tt.subscribe((s) => o.setValue(String(s.run?.nhanVat.linhThach ?? '')));

    // Bốn chỗ cắm sẵn của HUD (để thử một lượt)
    mod.ui.addSlot('characterTab', {
      id: 'thong_ke',
      title: 'Thống kê',
      mount(el, tt) {
        const draw = () => {
          const kit = tt.ui.kit;
          const row = (...kids) => {
            const d = document.createElement('div');
            d.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:4px 0';
            d.append(...kids);
            return d;
          };
          const step = [1, 10, 100, 1000];

          // Vùng chứa các stepper, dựng lại mỗi khi đổi bước (kit không cập nhật prop động)
          const stats = document.createElement('div');
          stats.style.cssText = 'display:flex;flex-direction:column;gap:10px';
          const drawStats = (v) => {
            stats.replaceChildren();
            const mk = (label, key) => stats.append(row(label,
              kit.stepper({ value: tt.state().run?.nhanVat.chiSo[key] ?? 0, max: 99999, step: v, onChange: (nv) => tt.state().run.nhanVat.chiSo[key] = nv })));
            mk('Thần thức', 'than_thuc');
            mk('Ngộ Tính', 'ngo_tinh');
            mk('Khí Vận', 'khi_van');
            mk('Thân pháp', 'than_phap');
            mk('Căn cốt', 'can_cot');
            mk('Đạo tâm', 'dao_tam');
            stats.append(row('Điểm luân hồi', 
              kit.stepper({ value: tt.state().meta.diemLuanHoi ?? 0, max: 99999, step: v, onChange: (nv) => tt.state().meta.diemLuanHoi = nv })
            ));
            stats.append(row('Ô túi', 
              kit.stepper({ value: tt.state().run.nhanVat.oTuiThem ?? 0, max: 99999, step: v, onChange: (nv) => tt.state().run.nhanVat.oTuiThem = nv })
            ));
            stats.append(row('Tẩy', 
              kit.stepper({ value: tt.state().run.nhanVat.kinhMach.cho.doiMau ?? 0, max: 99999, step: v, onChange: (nv) => tt.state().run.nhanVat.kinhMach.cho.doiMau = nv })
            ));
          };
          drawStats(1);
          el.append(kit.select({ options: step, value: 1, onChange: (v) => drawStats(parseInt(v)) }));
          el.append(stats);
        };
        draw();
        return tt.subscribe(draw);
      },
    });
    mod.ui.addSlot('itemTooltip', { id: 'id_vat', mount: (el, tt, itemId) => (el.textContent = `Mod Mẫu: ${itemId}`) });
    mod.ui.addPanel({ id: 'kit', title: 'Bộ component', fab: false, mount: drawKitDemo });
    mod.ui.addPanel({ id: 'kit_tui_do', title: 'Item đang có', fab: false, mount : drawTuiDo});
    mod.ui.addSlot('mapLayer', {
      id: 'cham',
      mount(layer, tt) {
        // Chấm đỏ ở góc trên trái bản đồ (tọa độ thế giới)
        const g = new tt.pixi.Graphics();
        g.circle(60, 60, 24).fill(0xff3030);
        layer.addChild(g);
        tt.map.requestRender();
        return () => g.destroy();
      },
    });
  },
});

/** Bày mọi component của `ui.kit`: giao diện đúng kiểu game, không cần React. Kit tạo trong mount tự gỡ khi khung đóng. */
function drawKitDemo(el, tt) {
  const kit = tt.ui.kit;
  const say = (text) => tt.ui.toast(text);
  const row = (...kids) => {
    const d = document.createElement('div');
    d.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:4px 0';
    d.append(...kids);
    return d;
  };

  el.append(kit.section({ title: 'Form' }));
  el.append(row(kit.button({ text: 'Nút chính', kind: 'chinh', onClick: () => say('bấm nút chính') }), kit.button({ text: 'Nút phụ', tip: 'Hộp chữ khi rê chuột' }), kit.button({ text: 'Nhỏ', icon: 'gear', kind: 'nho' })));
  el.append(row(kit.select({ options: [{ value: 'kim', label: 'Kim', hint: 'sắc bén' }, 'Mộc', 'Thủy'], value: 'kim', onChange: say })));
  el.append(row(kit.combobox({ options: ['Thanh Khê', 'Lạc Nhật Cốc', 'Vân Mộng Trạch'], placeholder: 'Gõ để tìm…', onChange: say })));
  el.append(row(kit.checkbox({ label: 'Tự kết lượt', hint: 'ví dụ', onChange: (v) => say(`tick: ${v}`) })));
  el.append(kit.radio({ options: ['Đánh', 'Chạy', 'Hàng'], value: 'Đánh', inline: true, onChange: say }));
  el.append(row(kit.input({ placeholder: 'Ghi chú', onEnter: (v) => say(`nhập: ${v}`) }), kit.input({ type: 'number', value: 3, min: 0, max: 9 })));
  el.append(row(kit.stepper({ value: 1, min: 1, max: 10, onChange: (v) => say(`số: ${v}`) }), kit.slider({ value: 40, max: 100, showValue: true })));

  el.append(kit.section({ title: 'Khung' }));
  el.append(kit.row({ label: 'Linh thạch', value: tt.state().run?.nhanVat.linhThach ?? '-' }));
  el.append(kit.collapse({ title: 'Mục gập', summary: '2 dòng', mount: (box) => box.append('Nội dung trong mục gập.') }));
  el.append(kit.tabs({ tabs: [
    { id: 'mot', title: 'Tab một', mount: (box) => box.append('Nội dung tab một.') },
    { id: 'hai', title: 'Tab hai', mount: (box) => box.append(kit.richText({ text: 'Tab hai: hồi 30 khí huyết, nhận 5 linh thạch.', numbers: true })) },
  ] }));
  const pop = kit.button({ text: 'Lớp nổi', kind: 'nho', onClick: () => kit.popup(pop, { mount: (box) => box.append('Bấm ra ngoài để đóng.') }) });
  el.append(row(
    kit.button({ text: 'Hộp', kind: 'nho', onClick: async () => {
      const n = await kit.modal({ title: 'Hộp của mod', mount: (box) => box.append('Nội dung tự vẽ.'), buttons: [{ text: 'Đồng ý', kind: 'chinh' }, { text: 'Thôi' }] }).closed;
      say(`hộp đóng, nút ${n}`);
    } }),
    pop,
  ));

  el.append(kit.section({ title: 'Chữ, icon, vật' }));
  const hint = document.createElement('span');
  hint.textContent = 'Rê vào đây';
  kit.tip(hint, 'Tooltip gắn vào phần tử có sẵn.');
  el.append(row(kit.icon('puzzle'), kit.icon({ name: 'gear', size: 20 }), hint, kit.price(1250)));
  el.append(row(kit.itemIcon('item.vi_du_thanh_truc_kiem'), kit.itemTile({ id: 'item.vi_du_thanh_truc_kiem', count: 2, onClick: () => say('bấm ô vật') })));
}

function drawTuiDo(el, tt) {
  const kit = tt.ui.kit;
  const row = (...kids) => {
    const d = document.createElement('div');
    d.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:4px 0';
    d.append(...kids);
    return d;
  };
  const items = Object.entries(tt.state().run.nhanVat.tuiDo);
  let selected = null; // id vật đang chọn, hiện stepper cạnh ô đó

  const draw = () => {
    el.replaceChildren();
    // Thêm vật vào túi: bấm nút, cộng 1 vật mẫu (đổi id nếu muốn vật khác)
    el.append(row(kit.button({
      text: 'Thêm vật',
      kind: 'nho',
      onClick: () => {
        const tui = tt.state().run.nhanVat.tuiDo;
        tui['item.vi_du_thanh_truc_kiem'] = (tui['item.vi_du_thanh_truc_kiem'] ?? 0) + 1;
        draw();
      },
    })));
    if (!items.length) el.append('Túi trống.');
    items.forEach(([id, so]) => {
      const tile = kit.itemTile({ id, onClick: () => { selected = selected === id ? null : id; draw(); } });
      const hang = row(tile);
      if (selected === id) {
        const tui = tt.state().run.nhanVat.tuiDo;
        // Stepper hiện ngay cạnh vật đang chọn, đổi số lượng trực tiếp
        hang.append(kit.stepper({
          value: tui[id], max: 999999, step: 10,
          onChange: (v) => {
            tui[id] = v;
            if (v <= 0) { delete tui[id]; selected = null; }
            draw();
          },
        }));
      }
      el.append(hang);
    });
  };
  draw();
  return tt.subscribe(draw);
}
