import { toast } from 'react-toastify';

export const showSuccess = (message) => {
  toast.success(message, {
    position: "bottom-right",
    autoClose: 3000,
    className: 'toast-success',
    closeButton: <button className="Toastify__close-button">✖</button>,
  });
};

export const showError = (message) => {
  toast.error(message, {
    position: "bottom-right",
    autoClose: 3000,
    className: 'toast-error',
    closeButton: <button className="Toastify__close-button">✖</button>,
  });
};