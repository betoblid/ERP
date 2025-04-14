import PainelEditorPorduto from "./painelEditorPorduto";


export default async function Page({params}: {params: {id: string}}) {
    return (
        <PainelEditorPorduto id={params.id}/>
    )
}