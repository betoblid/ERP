
import { PainelEditor } from "./painel_editor"

interface PageEditor {
  params: {
    id: string
  }
}

export default function EditarFuncionario({params}: PageEditor) {
 
  return (
    <PainelEditor id={params.id}/>
  )
}

