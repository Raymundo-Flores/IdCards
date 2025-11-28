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

    // ✅ Congelar DOM antes de capturar
    this.cdr.detectChanges();
    await new Promise(resolve => setTimeout(resolve, 100));

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'in',
      format: [4, 6]
    });

    /* === FRONTAL === */
    const frontal = document.querySelector('#cardFrontal .card') as HTMLElement;

    const canvasFrontal = await html2canvas(frontal, {
      scale: 3,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null
    });

    pdf.addImage(canvasFrontal.toDataURL('image/png'), 'PNG', 0, 0, 4, 6);

    /* === TRASERA === */
    await new Promise(resolve => setTimeout(resolve, 200));

    pdf.addPage([4, 6], 'portrait');

    const trasera = document.querySelector('#cardTrasera .card') as HTMLElement;

    const canvasTrasera = await html2canvas(trasera, {
      scale: 3,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null
    });

    const imgTrasera = canvasTrasera.toDataURL('image/png');

    pdf.addImage(imgTrasera, 'PNG', 0, 0, 4, 6, undefined, 'NONE', 180);

    pdf.save('credencial.pdf');
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
