import { EditorLayout } from "./ui/EditorLayout"


async function startApp() {

    const layout = new EditorLayout()
    await layout.initialize()

}

startApp().then(() => console.log("UWUScratch stawting..."))

