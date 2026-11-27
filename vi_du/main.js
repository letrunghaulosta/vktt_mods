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
    mod.ui.addPanel({ id: 'kit_tui_do', title: 'Item đang có', fab: false, mount : drawTuiDo});
  },
});

function drawTuiDo(el, tt) {
  const kit = tt.ui.kit;
  // Giữ nội dung trong khung: cho phép cuộn dọc và xuống dòng
  el.style.cssText = 'display:flex;flex-wrap:wrap;gap:4px';
  const row = (...kids) => {
    const d = document.createElement('div');
    d.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:4px 0;min-width:0';
    d.append(...kids);
    return d;
  };

  const items = Object.entries(tt.state().run.nhanVat.tuiDo);
  let selected = null; // id vật đang chọn, hiện stepper cạnh ô đó

  const draw = () => {
    el.replaceChildren();
    // Thêm vật vào túi: bấm nút, cộng 1 vật mẫu (đổi id nếu muốn vật khác)
    // Chỉ giữ MỘT popup gợi ý: đóng cái cũ trước khi mở cái mới
    const phamCap = ['Phàm phẩm', 'Hoàng phẩm', 'Huyền phẩm', 'Địa phẩm', 'Thiên phẩm', 'Tiên phẩm', 'Thần phẩm', 'Nghịch Thiên', 'Bất Diệt'];

    let goiY = null; // { close() } của popup đang mở
    let foundItem = '';
    const addItem = kit.input({
      onChange: (v) => {
        goiY?.close(); // đóng popup cũ, tránh chồng lên nhau
        if (!v) { goiY = null; return; }
        const findItems = ({ten}) => {return ten.toLowerCase().includes(v.toLowerCase())? true : false};
        goiY = kit.popup(addItem, {
          mount: (box) => {
            const found = Map.groupBy(tt.content.items.values(), findItems).get(true) ?? [];

            if (!found.length) box.textContent = 'Không tìm thấy vật nào.';
            else found.forEach((item) => {
              // Bọc trong phần tử bấm được: onclick của mình + giữ tooltip/icon cũ của kit
              const chon = row(kit.itemIcon({ id: item.id, size: 16 }), item.ten + "-" + phamCap[item.pham_cap-1]);
              chon.style.cssText += 'cursor:pointer';
              chon.onclick = () => {
                const tui = tt.state().run.nhanVat.tuiDo;
                tui[item.id] = (tui[item.id] ?? 0) + 1;
                goiY?.close(); goiY = null;
                draw();
              };
              box.append(chon);
            });
            
          },
        });
      },
    });
    el.append(row(addItem));

    el.append(row(kit.button({
      text: 'Thêm vật',
      kind: 'nho',
      onClick: () => {
        const tui = tt.state().run.nhanVat.tuiDo;
        if(foundItem !== '') tui[foundItem] = (tui[foundItem] ?? 0) + 1;
        foundItem = '';
        addItem.value = ''; // xóa ô tìm (nếu kit.input hỗ trợ set value)
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