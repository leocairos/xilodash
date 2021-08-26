import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
  Button,
  Portal,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
} from "@chakra-ui/react"
import React from "react"
import { currencyFormat, numberFormat } from "../../util/format";
import { IOrderSummary } from "../../util/IOrderSummary"

const OrderDetail = (item: IOrderSummary) => {
  const qtde = item.Qtde;
  const materialFase = (item.materialFase)/qtde;
  const materialAcumulado = item.Material/qtde;
  const moFase = item.moFase ? item.moFase/qtde : 0;
  const moAcumulado = item.MaoDeObra/qtde;
  const ggfFase = item.ggfFase ? item.ggfFase/qtde : 0;
  const ggfAcumulado = item.GGF/qtde;
  return (
    <Popover>
      <PopoverTrigger>
        <a>
          <Table size="sm">
            <TableCaption placement="top" color="whiteAlpha.900">
              {item.Produto} [{item.Tipo}] {item.Descricao} <br/>
              Produção: {numberFormat(qtde)} kg | CM: {currencyFormat(item.CustUnit)}
            </TableCaption>
              <Thead>
                <Tr>
                  <Th color="whiteAlpha.900">Partes</Th>
                  <Th isNumeric color="whiteAlpha.900">Fase</Th>
                  <Th isNumeric color="whiteAlpha.900">Acumulado</Th>
                </Tr>
              </Thead>
              <Tbody>
                <Tr>
                  <Td>Material</Td>
                  <Td isNumeric>{currencyFormat(materialFase)}</Td>
                  <Td isNumeric>{currencyFormat(materialAcumulado)}</Td>
                </Tr>
                <Tr>
                  <Td>Mão de Obra</Td>
                  <Td isNumeric>{currencyFormat(moFase)}</Td>
                  <Td isNumeric>{currencyFormat(moAcumulado)}</Td>
                </Tr>
                <Tr>
                  <Td>Gastos Gerais</Td>
                  <Td isNumeric>{currencyFormat(ggfFase)}</Td>
                  <Td isNumeric>{currencyFormat(ggfAcumulado)}</Td>
                </Tr>
              </Tbody>
              <Tfoot>
                <Tr>
                  <Th color="whiteAlpha.900">Total</Th>
                  <Th isNumeric color="whiteAlpha.900">{currencyFormat(materialFase+moFase+ggfFase)}</Th>
                  <Th isNumeric color="whiteAlpha.900">{currencyFormat(item.CustUnit)}</Th>
                </Tr>
              </Tfoot>
            </Table>
        </a>
      </PopoverTrigger>
      <Portal>
        <PopoverContent >
          <PopoverArrow />
          <PopoverHeader>
            {item.CC} {item.AnoMes} <br/>
            <strong>{item.Produto} [{item.Tipo}] {item.Descricao}</strong>
          </PopoverHeader>
          <PopoverCloseButton />
          <PopoverBody>

            {/* {JSON.stringify(item.detail)} */}
            <table >
              <thead>
                <th>Componente</th>
                <th>Descrição</th>
                <th>Qtde</th>
                <th>Custo</th>
              </thead>
              <tbody>
                {(item.detail.map(comp => (
                  <tr id={item.Produto}>
                    <td>{comp.Produto}</td>
                    <td>{comp.Descricao}</td>
                    <td>{numberFormat(comp.Qtde)}</td>
                    <td>{currencyFormat(comp.CustoTotal)}</td>
                  </tr>
                )))}
              </tbody>
            </table>

          </PopoverBody>
          <PopoverFooter>
            Produção: {numberFormat(qtde)} kg | CM: {currencyFormat(item.CustUnit)}
          </PopoverFooter>
        </PopoverContent>
      </Portal>
    </Popover>
  )
}

export { OrderDetail }
