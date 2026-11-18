# Đổi API cho mod

Mỗi lần đổi / bỏ thứ mod dùng (`window.tuTien`, `game.*`, state, `core`) ghi một dòng ở đây, mới nhất ở trên. Đổi phần trong bảng "Bản này có gì" của [README](tai-lieu-api.md) thì tăng `apiVersion` (`app/src/game/mod/gate.ts`). Thêm mới không cần ghi.

## apiVersion 1 (2026-11-04)

- Người có tên trong sự kiện (2026-11-11, thêm, không tăng `apiVersion`; gdd 69, chỉ kiếp Thế giới sống): nguồn biến `from: nguoi_o` (khóa `giu` / `dau` / `khach` / `vai` / `pham` / `tu_si` / `lui`, giá trị người seed mã `@o|`) và `from: tong_diet` (khóa `nam` / `phe`, giá trị `@td|`); khóa `chan_dung` trên `role.*`; lõi `placePersonCandidates`, `resolvePlaceVar`, `fallenSectCandidates`, `seedFaceGroup`; hằng `FALLEN_SECT_PICK_YEARS`, `FALLEN_SECT_NEAREST` ở `balance/social`. `tuTien.assets.npcFace` nhận thêm `group` (tùy chọn, nhóm chân dung phàm nhân). State `NpcState.faceGroup`.

- Danh tiếng + Đối đầu (2026-11-11, thêm, không tăng `apiVersion`; gdd 68, chỉ kiếp Thế giới sống): hiệu ứng `danh_nghe`, `ti_thi_thang`, `ra_tay_chay`; điều kiện `danh_hieu`, `tieng`, `noi_danh`, `nuoc_truy_na`; bảng nội dung `title.*` (hiệu), lời đồn về người chơi và lời Đối đầu (`uy_hiep_thanh`, `uy_hiep_bai`, `cuop_pham`, `tui_rong`, `lay_duoc`, `bao_thu_than`, `du_dang_diet_tong`, `nuoc_truy_na`), biến `{hieu}` / `{nan_nhan}`; lõi `recordDeed`, `fameIn`, `fameAttitude`, `purseOf`; hằng `DEED_WEIGHT`, `KIN_FOE_CHANCE`… ở `balance/social` (đổi qua `withBalance`). State `run.fame`, `run.stains`, `run.countryWanted`, `run.duelLog`; `NpcState.duelYear` / `robbedBeat` / `threatBeat` / `slainYear`.

- Trần viên đan cộng dồn (2026-11-10, không tăng `apiVersion`, lõi ngoài gdd 60): bỏ `character.realmDrugUses`, thay bằng `character.drugUsesLeft(nv, item)` (số viên còn thấm, Infinity khi không trần); `drugCapped` / `noteRealmDrugUse` giờ nhận vật (`{ id, canh_gioi }`) thay vì id. State `nhanVat.drugCapUses` thay `drugRealmUses` (trường cũ chỉ còn để đọc save).

- Mặt lộ thêm (2026-11-09, thêm, không tăng `apiVersion`): hàm `lamViecThuongTruc` / `doStandingTask` (việc vặt điện nhiệm vụ), `yearlyExpRate` và hằng `CRAFTED_YEARLY_EXP` (linh thú luyện chế); ba hằng cân bằng nhận thêm setter: `AUCTION_HAND_LOT_SHARE`, `NATAL_RUNE_MAX_LEVEL`, `NPC_CULTIVATION_DRUG_RETENTION` (đổi được qua `withBalance` / hằng cân bằng như các hằng khác).

- Kit thêm (2026-11-08, thêm, không tăng `apiVersion`; gdd 60 §20.1): `kit.toggle`, `kit.textarea`, `kit.badge`, `kit.progress`, `kit.empty`.

- Lấy ảnh (2026-11-08, thêm, không tăng `apiVersion`; gdd 60 §8.4): `tuTien.assets.get(kind, id)`, `tuTien.assets.npcFace(id, gioi, age, danhPhan?)`.

- Tỉ thí qua mod (2026-11-07, thêm, không tăng `apiVersion`; gdd 60 §23): `tuTien.pvp.openRoom({ role, transport })`, `mod.pvp`; sự kiện `pvpEnded`.

- Móc luyện chế (2026-11-07, thêm, không tăng `apiVersion`; gdd 60 §22): modifier `craftDistribution`; sự kiện `professionPromoted`; `craft` thêm `profession`, `kind` và giờ báo cả mẻ khảo hạch / mẻ ảo (hai loại này không có `recipe`; mod lọc theo `recipe` vẫn chạy như cũ).

- Bộ component (2026-11-07, thêm, không tăng `apiVersion`; gdd 60 §20): `ui.kit` (form, khung, chữ, vật, `modal`, `popup`, `tip`); `addPanel({ fab: false })` cho khung không cần nút nổi.

- Mở rộng (2026-11-06, thêm, không tăng `apiVersion`; gdd 60 §19): `tuTien.core` có cả hàm / hằng không export của lõi (không cam kết, không ghi ở đây khi đổi); `tuTien.hud` (store giao diện HUD).

- Góp ý modder (2026-11-06, thêm, không tăng `apiVersion`; gdd 60 §18): patch `$append`; `mod.original(id)`; `ui.gamePanel(tên, mở?)`; sự kiện `itemUsed`; `assets.set` nhận `/img/…`; `game.readCtx({ live })`; `core['progress/dot_pha']`: `xungKich` trả `BreakthroughOutcome` (trước trả `undefined`), thêm `resolveBreakthrough`, `breakthroughGrade`; `core['mod/merge']`: `APPEND_KEY`, `patchLeaves`, `ModProblem.clash` / `clashAt`. Lỗi nội dung giờ bỏ từng mục thay vì cả phần nội dung của mod; không đoán được mod nào thì chỉ bỏ mod nạp sau cùng.

- Thêm `tuTien.pixi` (PixiJS của game) cho mod vẽ lớp `mapLayer`; mod mẫu dùng đủ 4 chỗ cắm.
- Đợt 4 phần nạp (thêm, không tăng `apiVersion`): gói `mod.yaml` + `content/` + `img/` + `main.js`, cài trong game (IndexedDB), thư mục `mods/` của app; `ModInfo.description`; `mod.options` nhận giá trị người chơi chọn; lõi `core['mod/manifest']` (`parseManifest`, `optionValues`, `excludedByOptions`).

- Bản dịch (thêm, không tăng `apiVersion`): `mod.addTranslation(lang, files)`, `mod.addUiStrings(lang, strings)`, gói `i18n/<lang>/` (+ `_ui.yaml`); nằm ngoài `hasContent` / dấu mod.
- Đợt 3 (thêm, không tăng `apiVersion`): `mod.addContent`, `mod.patchContent`, `ModInfo.overrides`, `tuTien.assets.set`; `run.mods` / `meta.mods`; `game.missingMods`, `game.dropMissingMods()`, `game.modReport`; lõi `core['mod/merge']`, `core['mod/stamp']`, `core['mod/prune']`.

- Mở `window.tuTien`: `game`, `state`, `subscribe`, `content`, `map`, `core`, `ui.toast`, `register`, hàng đợi `window.tuTienMods` (pha `ready`).
- Thêm `game.readCtx()`, `core['encounter/choice_risk'].revealedCombatRisk`.
- Export thêm cho Tool Trợ Lý: `progress/tournament.trialOpponent`, `progress/be_quan.retreatTargetGain`, `progress/be_quan.retreatGain`, `progress/luyen_che.nguonDiemGoc`, `progress/tong_mon.tienCuDuoc`, `progress/natal_act.devourItemError`.
