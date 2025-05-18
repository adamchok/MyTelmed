export const calculateReadingTime = (text: string) => {
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
};
