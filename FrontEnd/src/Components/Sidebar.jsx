const NAV = [
  {
    label: "Giáo viên",

    key: "giao-vien",
    disabled: false,
    children: [
      { label: "Giáo viên", key: "teacher" },
      { label: "Vị trí công tác", key: "teacher-position" },
    ],
  },
];

export default function Sidebar({ active, onNavigate }) {
  return (
    <aside className="w-56 min-h-screen bg-white border-r border-gray-200 flex flex-col py-4 shrink-0">
      <div className="px-4 mb-6">
        <span className="text-lg font-bold text-purple-700"> EduSystem</span>
      </div>

      <nav className="flex flex-col gap-1 px-2">
        {NAV.map((item) => {
          if (item.disabled) {
            return (
              <div
                key={item.key}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 cursor-not-allowed"
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            );
          }

          const isParentActive =
            item.children && item.children.some((c) => c.key === active);

          return (
            <div key={item.key}>
              <div
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
                  isParentActive
                    ? "bg-purple-50 text-purple-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </div>

              {item.children && isParentActive && (
                <div className="ml-7 mt-1 flex flex-col gap-1">
                  {item.children.map((child) => (
                    <button
                      key={child.key}
                      onClick={() => onNavigate(child.key)}
                      className={`text-left px-3 py-1.5 rounded-lg text-sm cursor-pointer transition-colors ${
                        active === child.key
                          ? "bg-purple-100 text-purple-700 font-semibold"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {child.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
