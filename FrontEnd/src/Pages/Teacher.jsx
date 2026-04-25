import { useEffect, useMemo, useState } from "react";
import heroImg from "../assets/hero.png";
import refreshImg from "../assets/refresh.svg";
import eye from "../assets/eye.svg";

const API_BASE = "http://localhost:8080";

const DEGREE_OPTIONS = [
  "Trung học",
  "Cao đẳng",
  "Cử nhân",
  "Kỹ sư",
  "Thạc sĩ",
  "Tiến sĩ",
  "Phó Giáo Sư",
  "Giáo sư",
];

const initialForm = {
  name: "",
  dob: "",
  phoneNumber: "",
  email: "",
  identity: "",
  address: "",
  teacherPositions: [],
};

export default function Teacher() {
  const [openCreate, setOpenCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [positions, setPositions] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [teacherPositionInput, setTeacherPositionInput] = useState("");
  const [degrees, setDegrees] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTeachers = async (targetPage = page, targetLimit = limit) => {
    try {
      const res = await fetch(
        `${API_BASE}/teachers?page=${targetPage}&limit=${targetLimit}`,
      );
      const json = await res.json();
      setTeachers(json.data || []);
      setPage(json.pageNumber || targetPage);
      setLimit(json.limitNumber || targetLimit);
      setTotalItems(json.totalItems || 0);
      setTotalPages(json.totalPages || 1);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    let ignore = false;

    const loadInitialData = async () => {
      try {
        const [teacherRes, positionRes] = await Promise.all([
          fetch(`${API_BASE}/teachers?page=1&limit=10`),
          fetch(`${API_BASE}/teacher-positions`),
        ]);

        const [teacherJson, positionJson] = await Promise.all([
          teacherRes.json(),
          positionRes.json(),
        ]);

        if (!ignore) {
          setTeachers(teacherJson.data || []);
          setPage(teacherJson.pageNumber || 1);
          setLimit(teacherJson.limitNumber || 10);
          setTotalItems(teacherJson.totalItems || 0);
          setTotalPages(teacherJson.totalPages || 1);
          setPositions(positionJson.data || []);
        }
      } catch (error) {
        console.error(error);
      }
    };

    loadInitialData();

    return () => {
      ignore = true;
    };
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectTeacherPosition = (event) => {
    const selectedId = event.target.value;
    if (!selectedId) return;

    setForm((prev) => {
      if (prev.teacherPositions.includes(selectedId)) {
        return prev;
      }

      return {
        ...prev,
        teacherPositions: [...prev.teacherPositions, selectedId],
      };
    });

    setTeacherPositionInput("");
  };

  const handleRemoveTeacherPosition = (positionId) => {
    setForm((prev) => ({
      ...prev,
      teacherPositions: prev.teacherPositions.filter((id) => id !== positionId),
    }));
  };

  const handleAddDegree = () => {
    if (degrees.length > 0) return;

    setDegrees((prev) => [
      ...prev,
      {
        degreeType: "",
        school: "",
        major: "",
        isGraduated: true,
        year: "",
      },
    ]);
  };

  const handleDegreeChange = (index, field, value) => {
    setDegrees((prev) =>
      prev.map((degree, i) =>
        i === index ? { ...degree, [field]: value } : degree,
      ),
    );
  };

  const handleRemoveDegree = (index) => {
    setDegrees((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveTeacher = async () => {
    setLoading(true);
    try {
      const firstDegree = degrees[0];
      const yearValue = Number(firstDegree?.year);

      const payload = {
        ...form,
        role: "TEACHER",
        isActive: true,
        startDate: new Date().toISOString(),
        endDate: null,
        degreeType: firstDegree?.degreeType || "Cử nhân",
        school: firstDegree?.school || "Chưa cập nhật",
        major: firstDegree?.major || "Chưa cập nhật",
        year: Number.isNaN(yearValue) ? new Date().getFullYear() : yearValue,
        isGraduated: firstDegree?.isGraduated ?? true,
      };

      const response = await fetch(`${API_BASE}/teachers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Create teacher failed");
      }

      setForm(initialForm);
      setTeacherPositionInput("");
      setDegrees([]);
      setOpenCreate(false);
      await fetchTeachers(1, limit);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredTeachers = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return teachers;

    return teachers.filter((teacher) => {
      const user = teacher.userId || {};
      return [
        teacher.code,
        user.name,
        user.email,
        user.phoneNumber,
        user.address,
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword);
    });
  }, [teachers, search]);

  const positionNameById = useMemo(() => {
    return positions.reduce((acc, position) => {
      acc[position._id] = position.name;
      return acc;
    }, {});
  }, [positions]);

  const availablePositions = useMemo(() => {
    return positions.filter(
      (position) => !form.teacherPositions.includes(position._id),
    );
  }, [positions, form.teacherPositions]);

  const canClickAddDegree = useMemo(() => {
    const hasRequiredTeacherInfo =
      form.name.trim() &&
      form.dob &&
      form.phoneNumber.trim() &&
      form.email.trim() &&
      form.identity.trim() &&
      form.address.trim() &&
      form.teacherPositions.length > 0;

    const areExistingDegreesComplete = degrees.every(
      (degree) =>
        degree.degreeType.trim() &&
        degree.school.trim() &&
        degree.major.trim() &&
        String(degree.year).trim(),
    );

    return Boolean(
      hasRequiredTeacherInfo &&
      areExistingDegreesComplete &&
      degrees.length === 0,
    );
  }, [form, degrees]);

  const totalPagesSafe = Math.max(1, totalPages);
  const startItem = totalItems === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, totalItems);

  const pageNumbers = useMemo(() => {
    if (totalPagesSafe <= 5) {
      return Array.from({ length: totalPagesSafe }, (_, index) => index + 1);
    }

    if (page <= 3) {
      return [1, 2, 3, 4, 5];
    }

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
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">Giáo viên</h3>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Tìm kiếm thông tin"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-52 focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
          <button
            onClick={() => fetchTeachers(page, limit)}
            className="flex items-center gap-1 border border-gray-300 bg-white rounded-md px-3 py-1.5 text-sm hover:bg-gray-100 cursor-pointer"
          >
            <img className="size-3" src={refreshImg} alt="refresh" /> Tải lại
          </button>
          <button
            onClick={() => setOpenCreate(true)}
            className="flex items-center gap-1 bg-purple-600 text-white rounded-md px-3 py-1.5 text-sm hover:bg-purple-700 cursor-pointer"
          >
            + Tạo mới
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
        <table className="w-full min-w-275 border-collapse text-sm">
          <thead>
            <tr className="bg-purple-50 text-gray-700">
              <th className="p-3 text-left font-semibold whitespace-nowrap">
                Mã
              </th>
              <th className="p-3 text-left font-semibold whitespace-nowrap">
                Giáo viên
              </th>
              <th className="p-3 text-left font-semibold whitespace-nowrap">
                Trình độ (cao nhất)
              </th>
              <th className="p-3 text-left font-semibold whitespace-nowrap">
                Bộ môn
              </th>
              <th className="p-3 text-left font-semibold whitespace-nowrap">
                TT Công tác
              </th>
              <th className="p-3 text-left font-semibold whitespace-nowrap">
                Địa chỉ
              </th>
              <th className="p-3 text-left font-semibold whitespace-nowrap">
                Trạng thái
              </th>
              <th className="p-3 text-left font-semibold whitespace-nowrap">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredTeachers.map((teacher) => (
              <tr
                key={teacher.code}
                className="border-t border-gray-100 hover:bg-gray-50"
              >
                <td className="p-3 font-mono">{teacher.code}</td>
                <td className="p-3">
                  <div className="flex items-start gap-2">
                    <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center shrink-0">
                      {teacher?.userId?.name?.[0] || "?"}
                    </div>
                    <div>
                      <p className="font-semibold">
                        {teacher?.userId?.name || "-"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {teacher?.userId?.email || "-"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {teacher?.userId?.phoneNumber || "-"}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <p>Bậc: {teacher?.degrees?.[0]?.degreeType || "-"}</p>
                  <p className="text-gray-500 text-xs">
                    Chuyên ngành: {teacher?.degrees?.[0]?.major || "-"}
                  </p>
                </td>
                <td className="p-3">N/A</td>
                <td className="p-3">
                  {Array.isArray(teacher.teacherPositions)
                    ? teacher.teacherPositions
                        .map((id) => positionNameById[id])
                        .filter(Boolean)
                        .join(", ") || "-"
                    : positionNameById[teacher.teacherPositions] || "-"}
                </td>
                <td className="p-3">{teacher?.userId?.address || "-"}</td>
                <td className="p-3">
                  <span className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    {teacher.isActive ? "Đang công tác" : "Ngừng"}
                  </span>
                </td>
                <td className="p-3">
                  <button
                    type="button"
                    className="border flex gap-2 border-gray-300 bg-white rounded-md px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-100"
                  >
                    <img
                      className="size-4 self-center"
                      src={eye}
                      alt="detail"
                    />{" "}
                    Chi tiết
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
              fetchTeachers(1, nextLimit);
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
            onClick={() => fetchTeachers(page - 1, limit)}
            disabled={page <= 1}
            className="border border-gray-300 bg-white rounded px-2 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ‹
          </button>

          {pageNumbers.map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              onClick={() => fetchTeachers(pageNumber, limit)}
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
            onClick={() => fetchTeachers(page + 1, limit)}
            disabled={page >= totalPagesSafe}
            className="border border-gray-300 bg-white rounded px-2 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ›
          </button>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-50 p-2 flex justify-end transition-all duration-500 ease-in-out ${
          openCreate
            ? "bg-black/30 opacity-100 pointer-events-auto"
            : "bg-black/0 opacity-0 pointer-events-none"
        }`}
      >
        <div
          className={`h-full w-1/2 bg-white border border-gray-200 rounded-sm overflow-hidden flex flex-col transition-transform duration-500 ease-in-out ${
            openCreate ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="px-4 py-2 border-b border-gray-200 flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setOpenCreate(false);
                setDegrees([]);
              }}
              className="text-gray-500 hover:text-gray-700 text-lg cursor-pointer"
            >
              ✕
            </button>
            <h2 className="text-base font-semibold">Tạo thông tin giáo viên</h2>
          </div>

          <div className="p-4 overflow-auto">
            <div className="flex gap-4">
              <div className="w-48 shrink-0">
                <img
                  src={heroImg}
                  alt="avatar"
                  className="w-32 h-32 object-cover rounded-md border border-gray-200"
                />
              </div>

              <div className="flex-1">
                <div className="mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-px flex-1 bg-purple-200" />
                    <p className="text-sm font-semibold">Thông tin cá nhân</p>
                    <div className="h-px flex-8 bg-purple-200" />
                  </div>

                  <div className="grid grid-cols-2 gap-x-3 gap-y-3">
                    <div>
                      <label className="block text-sm mb-1">
                        <span className="text-red-500">*</span> Họ và tên
                      </label>
                      <input
                        name="name"
                        value={form.name}
                        onChange={handleInputChange}
                        placeholder="VD: Nguyễn Văn A"
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">
                        <span className="text-red-500">*</span> Ngày sinh
                      </label>
                      <input
                        type="date"
                        name="dob"
                        value={form.dob}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">
                        <span className="text-red-500">*</span> Số điện thoại
                      </label>
                      <input
                        name="phoneNumber"
                        value={form.phoneNumber}
                        onChange={handleInputChange}
                        placeholder="Nhập số điện thoại"
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">
                        <span className="text-red-500">*</span> Email
                      </label>
                      <input
                        name="email"
                        value={form.email}
                        onChange={handleInputChange}
                        placeholder="example@school.edu.vn"
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">
                        <span className="text-red-500">*</span> Số CCCD
                      </label>
                      <input
                        name="identity"
                        value={form.identity}
                        onChange={handleInputChange}
                        placeholder="Nhập số CCCD"
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">
                        <span className="text-red-500">*</span> Địa chỉ
                      </label>
                      <input
                        name="address"
                        value={form.address}
                        onChange={handleInputChange}
                        placeholder="Địa chỉ thường trú"
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px flex-1 bg-purple-200" />
                <p className="text-sm font-semibold">Thông tin công tác</p>
                <div className="h-px flex-8 bg-purple-200" />
              </div>

              <div>
                <label className="block text-sm mb-1">
                  <span className="text-red-500">*</span> Vị trí công tác
                </label>
                <div className="w-full border border-gray-300 rounded px-2 py-1.5 min-h-10 flex flex-wrap items-center gap-2 bg-white">
                  {form.teacherPositions.map((positionId) => (
                    <span
                      key={positionId}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-700"
                    >
                      {positionNameById[positionId] || "Unknown"}
                      <button
                        type="button"
                        onClick={() => handleRemoveTeacherPosition(positionId)}
                        className="text-purple-700 hover:text-purple-900"
                      >
                        ✕
                      </button>
                    </span>
                  ))}

                  <select
                    value={teacherPositionInput}
                    onChange={handleSelectTeacherPosition}
                    className="flex-1 min-w-52.5 text-sm bg-transparent outline-none"
                    disabled={availablePositions.length === 0}
                  >
                    <option value="" hidden />
                    {availablePositions.map((position) => (
                      <option key={position._id} value={position._id}>
                        {position.code} - {position.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px flex-1 bg-purple-200" />
                <p className="text-sm font-semibold">Học vị</p>
                <div className="h-px flex-10 bg-purple-200" />
              </div>

              <div className="flex justify-end mb-2">
                <button
                  type="button"
                  disabled={!canClickAddDegree}
                  onClick={handleAddDegree}
                  className="border border-gray-300 bg-white rounded px-2 py-1 text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Thêm
                </button>
              </div>

              <div className="border border-gray-200 rounded overflow-hidden">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-purple-50 text-left">
                      <th className="p-2 font-semibold">Bậc</th>
                      <th className="p-2 font-semibold">Trường</th>
                      <th className="p-2 font-semibold">Chuyên ngành</th>
                      <th className="p-2 font-semibold">Trạng thái</th>
                      <th className="p-2 font-semibold">Tốt nghiệp</th>
                      <th className="p-2 font-semibold"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {degrees.map((degree, index) => (
                      <tr
                        key={`degree-${index}`}
                        className="border-t border-gray-100"
                      >
                        <td className="p-2">
                          <select
                            value={degree.degreeType}
                            onChange={(e) =>
                              handleDegreeChange(
                                index,
                                "degreeType",
                                e.target.value,
                              )
                            }
                            className="w-full border border-amber-300 rounded px-2 py-1 text-sm bg-white"
                          >
                            <option value="">Chọn học vị</option>
                            {DEGREE_OPTIONS.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-2">
                          <input
                            value={degree.school}
                            onChange={(e) =>
                              handleDegreeChange(
                                index,
                                "school",
                                e.target.value,
                              )
                            }
                            placeholder="Trường theo học"
                            className="w-full border border-amber-300 rounded px-2 py-1 text-sm"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            value={degree.major}
                            onChange={(e) =>
                              handleDegreeChange(index, "major", e.target.value)
                            }
                            placeholder="Chuyên ngành"
                            className="w-full border border-amber-300 rounded px-2 py-1 text-sm"
                          />
                        </td>
                        <td className="p-2">
                          <label className="inline-flex items-center gap-1 text-sm">
                            <input
                              type="checkbox"
                              checked={degree.isGraduated}
                              onChange={(e) =>
                                handleDegreeChange(
                                  index,
                                  "isGraduated",
                                  e.target.checked,
                                )
                              }
                            />
                            Hoàn thành
                          </label>
                        </td>
                        <td className="p-2">
                          <input
                            value={degree.year}
                            onChange={(e) =>
                              handleDegreeChange(index, "year", e.target.value)
                            }
                            placeholder="Năm/Dự kiến"
                            className="w-full border border-amber-300 rounded px-2 py-1 text-sm"
                          />
                        </td>
                        <td className="p-2 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveDegree(index)}
                            className="border border-gray-300 bg-white rounded px-2 py-1 text-xs hover:bg-gray-100"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {degrees.length === 0 && (
                  <div className="h-24 flex flex-col items-center justify-center text-gray-400 text-sm">
                    <span className="text-2xl">🧺</span>
                    Trống
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 p-3 flex justify-end">
            <button
              onClick={handleSaveTeacher}
              disabled={loading}
              className="border border-gray-300 bg-white rounded px-3 py-1.5 text-sm hover:bg-gray-100 disabled:opacity-50"
            >
              {loading ? "Đang lưu..." : "💾 Lưu"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
