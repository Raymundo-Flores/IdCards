import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-credencial-ferrari',
  templateUrl: './credencial-ferrari.html',
  styleUrls: ['./credencial-ferrari.css'],
  imports: [
    CommonModule,
    FormsModule
  ]
})
export class CredencialFerrariComponent {

  constructor(private cdr: ChangeDetectorRef) {}

  nombre: string = '';
  fecha: string = '';
  fotoURL: string | ArrayBuffer | null = null;

  onFotoSeleccionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.fotoURL = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

async generarPDF() {

  const frontalOriginal = document.querySelector('#cardFrontal .card') as HTMLElement;
  const traseraOriginal = document.querySelector('#cardTrasera .card') as HTMLElement;

  const capture = document.getElementById('capture-area') as HTMLElement;

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'in',
    format: [4, 6]
  });

  /*********** 1. CAPTURAR FRONTAL ************/
  capture.innerHTML = ""; // limpiar

  const cloneFront = frontalOriginal.cloneNode(true) as HTMLElement;
  cloneFront.classList.add("capture-card");
  capture.appendChild(cloneFront);

  await new Promise(r => setTimeout(r, 100));

  const canvasFront = await html2canvas(cloneFront, {
    scale: 3,
    useCORS: true,
    backgroundColor: null
  });

  pdf.addImage(canvasFront.toDataURL("image/png"), "PNG", 0, 0, 4, 6);

  /*********** 2. CAPTURAR TRASERA ************/
  pdf.addPage();

  capture.innerHTML = ""; // limpiar

  const cloneBack = traseraOriginal.cloneNode(true) as HTMLElement;
  cloneBack.classList.add("capture-card");
  capture.appendChild(cloneBack);

  await new Promise(r => setTimeout(r, 100));

  const canvasBack = await html2canvas(cloneBack, {
    scale: 3,
    useCORS: true,
    backgroundColor: null
  });

  pdf.addImage(canvasBack.toDataURL("image/png"), "PNG", 0, 0, 4, 6);

  pdf.save("credencial.pdf");
}



  limpiarCampos(): void {
    this.nombre = '';
    this.fecha = '';
    this.fotoURL = null;

    const inputFoto = document.getElementById('foto') as HTMLInputElement;
    if (inputFoto) {
      inputFoto.value = '';
    }
  }
}
