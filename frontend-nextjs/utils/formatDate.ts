export const formattedDate = (inputDate: string) => {
  const dateObject = new Date(inputDate);
  const day = dateObject.getDate().toString().padStart(2, "0");
  const month = (dateObject.getMonth() + 1).toString().padStart(2, "0");
  const year = dateObject.getFullYear().toString().slice(-2);

  const formattedDate = `${day}-${month}-${year}`;
  return formattedDate;
};
