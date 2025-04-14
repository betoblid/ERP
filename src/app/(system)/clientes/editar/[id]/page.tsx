import { EditarCliente } from "./painel_editor";

export default function page({params}: {params: {id: string}}) {


  return (
    <>
        <EditarCliente id={params.id}/>
    </>
  )
}

