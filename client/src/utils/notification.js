import { toast } from 'react-toastify';

export const showSuccess = (message) => {
  toast.success(message, {
    position: "bottom-right",
    autoClose: 3000,
    className: 'toast-success',  // Klasa stylu dla sukcesu
    closeButton: <button className="Toastify__close-button">✖</button>, // Dodanie własnego przycisku X
  });
};

export const showError = (message) => {
  toast.error(message, {
    position: "bottom-right",
    autoClose: 3000,
    className: 'toast-error', // Klasa stylu dla błędu
    closeButton: <button className="Toastify__close-button">✖</button>, // Dodanie własnego przycisku X
  });
};