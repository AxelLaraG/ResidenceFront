import { useState, useRef, useEffect } from "react";
import UserMenu from "../UserMenu/UserMenu";

const Header = ({ username, email, vista, onLogout, role, onChangeView }) => {
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
      <div className="w-full max-w-3xl mx-auto flex justify-between items-center">
        {vista === "1" && (
          <div className="flex items-center">
            <h1 className="text-xl md:text-2xl font-semibold text-gray-800">
              Bienvenido de nuevo, {username}
            </h1>
          </div>
        )}
        {vista === "2" && (
          <div className="flex items-center">
            <h1 className="text-xl md:text-2xl font-semibold text-gray-800">
              Configuración de Esquemas
            </h1>
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
              <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-48 z-50">
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
