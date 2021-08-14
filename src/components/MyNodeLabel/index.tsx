import { currencyFormat, numberFormat } from "../../util/format";
import { IOrderSummary } from "../../util/IOrderSummary";

export const MyNodeLabel = (item: IOrderSummary) => {
  const qtde = item.Qtde;
  const materialFase = (item.materialFase)/qtde;
  const materialAcumulado = item.Material/qtde;
  const moFase = item.moFase ? item.moFase/qtde : 0;
  const moAcumulado = item.MaoDeObra/qtde;
  const ggfFase = item.ggfFase ? item.ggfFase/qtde : 0;
  const ggfAcumulado = item.GGF/qtde;
  return (
    <>
      <a href='#'  style={ {color: '#be2'}}>{item.CC} </a> {item.AnoMes} <br/>
      {item.Produto} [{item.Tipo}] {item.Descricao} <br/>
      Quantidade produzida: {numberFormat(qtde)} kg
      <table width="300">
        <thead>
          <th>Partes</th>
          <th>Fase</th>
          <th>Acumulado</th>
        </thead>
        <tbody>
          <tr>
            <td>Material</td>
            <td>{currencyFormat(materialFase)}</td>
            <td>{currencyFormat(materialAcumulado)}</td>
          </tr>
          <tr>
            <td>Mão de Obra</td>
            <td>{currencyFormat(moFase)}</td>
            <td>{currencyFormat(moAcumulado)}</td>
          </tr>
          <tr>
            <td>Gastos Gerais</td>
            <td>{currencyFormat(ggfFase)}</td>
            <td>{currencyFormat(ggfAcumulado)}</td>
          </tr>
        </tbody>
        <tfoot>
          <th>Total</th>
          <th>{currencyFormat(materialFase+moFase+ggfFase)}</th>
          <th>{currencyFormat(item.CustUnit)}</th>
        </tfoot>
      </table>
    </>)
}
