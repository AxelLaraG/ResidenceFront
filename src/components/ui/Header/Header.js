import { useState, useRef, useEffect } from "react";
import UserMenu from "../UserMenu/UserMenu";

const Header = ({
  username,
  email,
  vista,
  onLogout,
  role,
  onChangeView,
  // Nuevas props para el selector de institución
  institutions,
  selectedInstitution,
  onInstitutionChange,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const avatarMenuRef = useRef(null);

  const handleAvatarClick = () => {
    setShowMenu((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        avatarMenuRef.current &&
        !avatarMenuRef.current.contains(event.target)
      ) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center rounded-lg relative">
      <div className="w-full max-w-5xl mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl md:text-2xl font-semibold text-gray-800">
            {vista === "1"
              ? `Bienvenido, ${username}`
              : "Configuración de Esquemas"}
          </h1>
        </div>

        {/* Selector de Institución */}
        {vista === "1" && institutions && institutions.length > 0 && (
          <div className="relative">
            <select
              value={selectedInstitution || ""}
              onChange={(e) => onInstitutionChange(e.target.value)}
              className="appearance-none rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm font-medium text-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="" disabled>
                Seleccione Institución
              </option>
              {institutions.map((inst) => (
                <option key={inst} value={inst}>
                  {inst}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="relative flex items-center space-x-4">
          <div ref={avatarMenuRef}>
            <img
              src="https://placehold.co/40x40/E2E8F0/4A5568?text=A"
              alt="Avatar de usuario"
              className="rounded-full cursor-pointer"
              onClick={handleAvatarClick}
            />
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 z-50">
                <UserMenu
                  email={email}
                  onLogout={onLogout}
                  role={role}
                  onChangeView={onChangeView}
                  vista={vista}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
