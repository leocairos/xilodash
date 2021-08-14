export const numberFormat = (number: number) => (
  new Intl.NumberFormat('pt-BR').format(number)
)

export const currencyFormat = (number: number) => (
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 3 })
    .format(number)
)

export const backgroundNodeColor = (centroCusto: string) => {
  switch (centroCusto.substr(0, 3)) {
    case '031': return  '#90CDF4'; //Mineracao 031
    case '032': return  '#4299E1'; //Tratamento de Minerio 032
    case '033': return  '#3c6897'; //Moagem de Talco 033
    case '034': return  '#32435c'; //Moagem de Magnesita 034
    case '036': return  '#804ec2'; //Forno MHF 036
  }
}

export const borderNodeColor = (centroCusto: string, tipo: string, produto: string) => {
  const borderStyle = `${produto.substr(0, 3) === '018'
    ? '3px dashed'
    : tipo === 'PA'
      ? '4px double'
      : '2px solid'}`;
  switch (centroCusto.substr(0, 3)) {
    case '031': return  `${borderStyle} #4584ac`; //Mineracao 031
    case '032': return  `${borderStyle} #4584ac`; //Tratamento de Minerio 032
    case '033': return  `${borderStyle} #1014ec`; //Moagem de Talco 033
    case '034': return  `${borderStyle} #383838`; //Moagem de Magnesita 034
    case '036': return  `${borderStyle} #6d3c15`; //Forno MHF 036
  }
}
