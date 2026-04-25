import { useEffect, useMemo, useState } from "react";

const API_BASE = "http://localhost:8080";

const initialForm = { code: "", name: "", des: "", isActive: true };

export default function TeacherPosition() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const [positions, setPositions] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPositions = async (targetPage, targetLimit) => {
    try {
      const res = await fetch(
        `${API_BASE}/teacher-positions?page=${targetPage}&limit=${targetLimit}`,
      );
      const json = await res.json();
      setPositions(json.data || []);
      setPage(json.pageNumber || targetPage);
      setLimit(json.limitNumber || targetLimit);
      setTotalItems(json.totalItems || 0);
      setTotalPages(json.totalPages || 1);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `${API_BASE}/teacher-positions?page=1&limit=10`,
        );
        const json = await res.json();
        setPositions(json.data || []);
        setPage(json.pageNumber || 1);
        setLimit(json.limitNumber || 10);
        setTotalItems(json.totalItems || 0);
        setTotalPages(json.totalPages || 1);
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/teacher-positions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2500);
      setForm(initialForm);
      setDrawerOpen(false);
      await fetchPositions(1, limit);
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  const totalPagesSafe = Math.max(1, totalPages);
  const startItem = totalItems === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, totalItems);

  const pageNumbers = useMemo(() => {
    if (totalPagesSafe <= 5) {
      return Array.from({ length: totalPagesSafe }, (_, i) => i + 1);
    }
    if (page <= 3) return [1, 2, 3, 4, 5];
    if (page >= totalPagesSafe - 2) {
      return [
        totalPagesSafe - 4,
        totalPagesSafe - 3,
        totalPagesSafe - 2,
        totalPagesSafe - 1,
        totalPagesSafe,
      ];
    }
    return [page - 2, page - 1, page, page + 1, page + 2];
  }, [page, totalPagesSafe]);

  return (
    <div className="relative p-4">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-4">
        <span>Dữ liệu</span>
        <span className="mx-1">/</span>
        <span className="text-gray-800 font-medium">Vị trí công tác</span>
      </div>

      {/* Action buttons */}
      <div className="flex justify-end gap-2 mb-3">
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-1 bg-white border border-gray-300 rounded-md px-3 py-1.5 text-sm hover:bg-gray-100 cursor-pointer"
        >
          + Tạo
        </button>
        <button
          onClick={() => fetchPositions(page, limit)}
          className="flex items-center gap-1 bg-white border border-gray-300 rounded-md px-3 py-1.5 text-sm hover:bg-gray-100 cursor-pointer"
        >
          🔄 Làm mới
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-700">
              <th className="p-3 text-left font-semibold whitespace-nowrap">
                STT
              </th>
              <th className="p-3 text-left font-semibold whitespace-nowrap">
                Mã
              </th>
              <th className="p-3 text-left font-semibold whitespace-nowrap">
                Tên
              </th>
              <th className="p-3 text-left font-semibold whitespace-nowrap">
                Trạng thái
              </th>
              <th className="p-3 text-left font-semibold whitespace-nowrap">
                Mô tả
              </th>
              <th className="p-3 text-left font-semibold whitespace-nowrap"></th>
            </tr>
          </thead>
          <tbody>
            {positions.map((pos, index) => (
              <tr
                key={pos._id}
                className="border-t border-gray-100 hover:bg-gray-50"
              >
                <td className="p-3 text-gray-500">{startItem + index}</td>
                <td className="p-3 font-medium">{pos.code}</td>
                <td className="p-3">{pos.name}</td>
                <td className="p-3">
                  <span
                    className={`text-white text-xs font-semibold px-3 py-1 rounded-full ${
                      pos.isActive ? "bg-green-500" : "bg-gray-400"
                    }`}
                  >
                    {pos.isActive ? "Hoạt động" : "Ngừng"}
                  </span>
                </td>
                <td className="p-3 text-gray-600">{pos.des}</td>
                <td className="p-3 text-gray-400">
                  <button className="hover:text-gray-700 cursor-pointer text-base">
                    ⚙️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
        <p className="text-gray-600">
          Hiển thị {startItem}-{endItem} / {totalItems}
        </p>

        <div className="flex items-center gap-2">
          <label className="text-gray-600">Hiển thị</label>
          <select
            value={limit}
            onChange={(event) => {
              const nextLimit = Number(event.target.value);
              fetchPositions(1, nextLimit);
            }}
            className="border border-gray-300 rounded px-2 py-1 bg-white"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => fetchPositions(page - 1, limit)}
            disabled={page <= 1}
            className="border border-gray-300 bg-white rounded px-2 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ‹
          </button>

          {pageNumbers.map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              onClick={() => fetchPositions(pageNumber, limit)}
              className={`border rounded px-3 py-1 ${
                pageNumber === page
                  ? "bg-purple-600 text-white border-purple-600"
                  : "border-gray-300 bg-white hover:bg-gray-100"
              }`}
            >
              {pageNumber}
            </button>
          ))}

          <button
            type="button"
            onClick={() => fetchPositions(page + 1, limit)}
            disabled={page >= totalPagesSafe}
            className="border border-gray-300 bg-white rounded px-2 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ›
          </button>
        </div>
      </div>

      {/* Overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {showSuccess && (
          <div className="absolute top-2 left-2 right-2 bg-white border border-gray-200 shadow-sm rounded z-10">
            <div className="flex items-start gap-2 px-3 py-2">
              <span className="text-green-600 text-sm">✅</span>
              <p className="text-sm text-gray-700 leading-5 flex-1">
                Lưu thông tin vị trí công tác thành công!
              </p>
              <button
                type="button"
                onClick={() => setShowSuccess(false)}
                className="text-gray-400 hover:text-gray-700 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="h-1 bg-green-500 rounded-b" />
          </div>
        )}

        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-base">Vị trí công tác</h2>
          <button
            onClick={() => setDrawerOpen(false)}
            className="text-gray-400 hover:text-gray-700 text-lg cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Drawer body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
          {/* Mã */}
          <div>
            <label className="block text-sm font-medium mb-1">
              <span className="text-red-500 mr-1">*</span>Mã
            </label>
            <input
              name="code"
              value={form.code}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>

          {/* Tên */}
          <div>
            <label className="block text-sm font-medium mb-1">
              <span className="text-red-500 mr-1">*</span>Tên
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>

          {/* Mô tả */}
          <div>
            <label className="block text-sm font-medium mb-1">
              <span className="text-red-500 mr-1">*</span>Mô tả
            </label>
            <textarea
              name="des"
              value={form.des}
              onChange={handleChange}
              rows={4}
              className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none"
            />
          </div>

          {/* Trạng thái */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <span className="text-red-500 mr-1">*</span>Trạng thái
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setForm({ ...form, isActive: true })}
                className={`px-4 py-1.5 rounded-md text-sm font-semibold cursor-pointer transition-colors ${
                  form.isActive
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Hoạt động
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, isActive: false })}
                className={`px-4 py-1.5 rounded-md text-sm font-semibold cursor-pointer transition-colors ${
                  !form.isActive
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Ngừng
              </button>
            </div>
          </div>
        </div>

        {/* Drawer footer */}
        <div className="px-5 py-4 border-t border-gray-200 flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1 bg-white border border-gray-300 rounded-md px-4 py-1.5 text-sm hover:bg-gray-100 cursor-pointer disabled:opacity-50"
          >
            💾 Lưu
          </button>
        </div>
      </div>
    </div>
  );
}
