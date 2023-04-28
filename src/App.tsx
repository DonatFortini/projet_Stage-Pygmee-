import { invoke } from "@tauri-apps/api/tauri";
import { confirm, open } from '@tauri-apps/api/dialog';
import "./public/App.css";
import { parseCodeToGraph } from "./graph/graphGenerator";
import * as joint from 'jointjs';
import { readTextFile } from '@tauri-apps/api/fs';
import { useEffect } from "react";


var curent_file:string="";

function updateLabel(choice: string) {
  let cut=choice.split('/');
  let name=cut.pop()
  if (name) document.getElementById('label')!.innerText=name;   
}

/**
 * appele une fonction du back-end qui format le code du fichier selectioné le renvoi sous forme 
 * html et le display dans div codeDisplay
 * 
 * @param filepath chemin du fichier selectioné dans la fenêtre de dialogue
 */
async function updateCodeDisplay(filepath: string) {
  try {
    const result: string = await invoke('format_code', { filepath });
    const codeDisplay = document.getElementById("codeDisplay");
    codeDisplay!.innerHTML = result;

  } catch (error) {
    console.error(error);
  }
}

/**
 * appele une fonction du front-end qui parse le code du fichier selectioné le renvoi sous forme 
 * de diagramme html et le display dans div modelDisplay
 * 
 *@param filepath chemin du fichier selectioné dans la fenêtre de dialogue 
 */
async function updateModelDisplay(filepath: string) {
  readTextFile(filepath)
    .then(data => {
      let graph = parseCodeToGraph(data);
      new joint.dia.Paper({
        el: document.getElementById("modelDisplay"),
        model: graph,
        height: '100%',
        width: '100%'
      });
    })
    .catch(error => {
      console.error(error);
    });
}


/**
 * 
 * creer une barre d'outil comportant plusieurs bouton
 * qui interagissent avec le graphique
 */
function Toolbar() {
  async function add_link() {
    console.log('helo');
  }

  async function del_link() {

  }

  async function del_modl() {

  }

  async function add_modl() {

  }

  return (
    <div className="toolbar">
      <img src="./src/assets/link.svg" onClick={add_link} className="link" />
      <img src="./src/assets/module.svg" onClick={add_modl} className="mod" />
      <img src="./src/assets/del_link.svg" onClick={del_link} className="del_link" />
      <img src="./src/assets/del_module.svg" onClick={del_modl} className="del_mod" />
    </div>
  );
}


function Menu() {
  
  /**
   * ouvre une fenêtre de dialogue qui permet de selectioner un fichier pour le charger
   * dans l'editeur (code et model Display)
   */
  async function load_fichier() {
    let select = await open({
      defaultPath: "./simulation",
      multiple: false,
      filters:[{ name: 'DNL Files', extensions: ['dnl', 'DNL'] }]
    });
    if (select) {
      let choice: string = String(select);
      updateLabel(choice);
      updateCodeDisplay(choice);
      updateModelDisplay(choice);
    }
  }

  return (
    <div className="menu">
      <button>nouveau modèle</button>
      <button>creer une librairie</button>
      <button onClick={load_fichier}>ouvrir un modèle atomique</button>
    </div>
  );
}

function ExportButton() {
  /**
   * enregistre le ficgier final dnas le dossier téléchargements
   */
  async function finish() {
    let conf = await confirm('êtes-vous sûr de vouloir finir', 'Exporter');
    if (conf) {
      console.log("true");
    }
  }

  return (
    <button onClick={finish} className="export" >Exporter</button>
  );
}

function Header() {
  /**
   * ouvre une fenêtre de dialogue qui permet de selectioner un fichier pour le copier
   * dans le dossier simulation de l'appli pour l'avoir a disposition
   */
  async function import_sim() {
    let file = await open({
      multiple: true,
      filters:[{ name: 'DNL Files', extensions: ['dnl', 'DNL'] }]
    });
    if (file != null) {
      if (Array.isArray(file)) {
        invoke('copy_files', { files: file });
      }
    }
  }


  return (
    <div className="header">
      <img className='logo' src="./src/assets/logo_pygmee.png" alt="" />
      <h1>Pygmee-DEVS</h1>
      <div style={{ display: 'flex', justifyContent: "space-evenly" }}>
        <label id="label" className="label"></label>
        <button onClick={import_sim} >Importer</button>
      </div>
    </div>
  );
}

function CodeDisplay() {
  return (
    <div id="codeDisplay" className="codeDisplay" ></div>
  );
}

function ModelDisplay() {
  return (
    <div className="model-container">
      <div id="modelDisplay" className="modelDisplay" ></div>
      <Toolbar />
    </div>

  );
}

function Column() {
  return (
    <div className="column">
      <Menu />
      <ExportButton />
    </div>
  );
}

function MainScreen() {


  return (
    <div className="main">
      <Header />
      <div className="display">
        <CodeDisplay />
        <ModelDisplay />
      </div>
    </div>
  );
}

function App() {
  useEffect(() => {
    const save = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        SaveDoc();
      }
    };

    document.addEventListener('keydown', save);

    return () => {
      document.removeEventListener('keydown', save);
    };
  }, []);

  async function SaveDoc() {
    const reponse = await confirm('etes vous sûr de sauvegarder?');
    if (reponse) {
      invoke('save',{curent_file});
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', }}>
      <Column />
      <MainScreen />
    </div>
  );
}

export default App;



