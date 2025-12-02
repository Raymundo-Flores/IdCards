import { Component, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-credencial-ferrari',
  templateUrl: './credencial-ferrari.html',
  styleUrls: ['./credencial-ferrari.css'],
  imports: [CommonModule, FormsModule]
})
export class CredencialFerrariComponent {

  constructor(private cdr: ChangeDetectorRef) { }

  nombre: string = '';
  fecha: string | null = null;
  fotoURL: string | ArrayBuffer | null = null;

  /* Tamaño real en px → 10.2 × 14.2 cm */
  readonly WIDTH_PX = 386;
  readonly HEIGHT_PX = 536;

  /* ------------------------------
        VARIABLES PARA CÁMARA
  ------------------------------ */
  @ViewChild('video', { static: false }) videoRef!: ElementRef<HTMLVideoElement>;
  camaras: MediaDeviceInfo[] = [];
  stream: MediaStream | null = null;
  mostrarCamara = false;

  async iniciarCamara() {
    this.mostrarCamara = true;

    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      const dispositivos = await navigator.mediaDevices.enumerateDevices();

      this.camaras = dispositivos.filter(d => d.kind === "videoinput");

      if (this.camaras.length === 0) {
        alert("No se encontraron cámaras.");
        return;
      }

      this.iniciarCamaraConDispositivo(this.camaras[0].deviceId);

    } catch (error) {
      console.error("Error al detectar cámaras:", error);
    }
  }

  encenderCamara(event: Event) {
    const select = event.target as HTMLSelectElement;
    const deviceId = select.value;
    this.iniciarCamaraConDispositivo(deviceId);
  }

  iniciarCamaraConDispositivo(deviceId: string) {
    navigator.mediaDevices.getUserMedia({
      video: { deviceId: { exact: deviceId } }
    })
      .then(stream => {
        if (this.stream) {
          this.stream.getTracks().forEach(t => t.stop());
        }

        this.stream = stream;

        const video = this.videoRef.nativeElement;
        video.srcObject = stream;
        video.play();
      })
      .catch(err => {
        console.error("Error al iniciar la cámara:", err);
      });
  }

  capturarFoto() {
    if (!this.videoRef) return;

    const video = this.videoRef.nativeElement;

    const canvas = document.createElement('canvas');
    canvas.width = this.WIDTH_PX;
    canvas.height = this.HEIGHT_PX;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    this.fotoURL = canvas.toDataURL('image/png');
  }

  cerrarCamara() {
    this.mostrarCamara = false;

    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
  }

  onFotoSeleccionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        this.fotoURL = reader.result;
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  /* -------------------------
        GENERAR PDF AJUSTADO
  -------------------------- */

  async generarPDF() {

    const frontalOriginal = document.querySelector('#cardFrontal .card') as HTMLElement;
    const traseraOriginal = document.querySelector('#cardTrasera .card') as HTMLElement;

    const capture = document.getElementById('capture-area') as HTMLElement;

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [102, 142]   // ancho × alto EXACTO
    });

    /* -----------------------
        CAPTURA FRONTAL
    ------------------------*/
    capture.innerHTML = "";
    const cloneFront = frontalOriginal.cloneNode(true) as HTMLElement;
    cloneFront.style.width = this.WIDTH_PX + "px";
    cloneFront.style.height = this.HEIGHT_PX + "px";
    cloneFront.style.transform = "none";

    capture.appendChild(cloneFront);
    await new Promise(r => setTimeout(r, 80));

    const canvasFront = await html2canvas(cloneFront, {
      scale: 3,
      useCORS: true,
      backgroundColor: "#ffffff"
    });

    const frontImg = canvasFront.toDataURL("image/png");

    pdf.addImage(frontImg, "PNG", 0, 0, 102, 142);

    /* -----------------------
        CAPTURA TRASERA
    ------------------------*/
    pdf.addPage();
    capture.innerHTML = "";

    const cloneBack = traseraOriginal.cloneNode(true) as HTMLElement;
    cloneBack.style.width = this.WIDTH_PX + "px";
    cloneBack.style.height = this.HEIGHT_PX + "px";

    // 🔥 Rotación correcta para impresión tipo credencial
    cloneBack.style.transform = "rotate(180deg)";
    cloneBack.style.transformOrigin = "center center";

    capture.appendChild(cloneBack);
    await new Promise(r => setTimeout(r, 80));

    const canvasBack = await html2canvas(cloneBack, {
      scale: 3,
      useCORS: true,
      backgroundColor: "#ffffff"
    });

    const backImg = canvasBack.toDataURL("image/png");

    pdf.addImage(backImg, "PNG", 0, 0, 102, 142);

    pdf.save(`${this.nombre || 'credencial-ferrari'}.pdf`);
  }

  limpiarCampos(): void {
    this.nombre = '';
    this.fecha = null;
    this.fotoURL = null;

    const inputFoto = document.getElementById('foto') as HTMLInputElement;
    if (inputFoto) {
      inputFoto.value = '';
    }
  }
}
