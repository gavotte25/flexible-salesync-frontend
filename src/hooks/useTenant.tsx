const useTenant = () => {
    const origin = window.location.origin;
    const domain = import.meta.env.VITE_DOMAIN;
    const startIndex = origin.indexOf('://') + 3;
    const endIndex = origin.indexOf(domain) - 1;
    if (startIndex < 0 || endIndex < 0 || startIndex >= endIndex) {
        return '';
    }
    return origin.substring(startIndex, endIndex);
}

export default useTenant;