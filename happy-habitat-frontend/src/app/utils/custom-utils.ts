export class CustomUtils {
  static numDateToStrDate(timestamp: number): string {
  const msDate = new Date(timestamp * 1000); // convertir a milisegundos

  const formattedDate = msDate.toISOString().split('T')[0]; // 'yyyy-MM-dd'
  // console.log('fecha formateada', formattedDate); // "2022-01-19"
  return formattedDate;
}


}