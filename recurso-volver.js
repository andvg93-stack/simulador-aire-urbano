const main=document.querySelector("main");
if(main&&!main.querySelector('a[href="index.html"]')){
  const back=document.createElement("a");
  back.href="index.html";
  back.textContent="← Volver al simulador";
  back.style.cssText="display:inline-block;margin-bottom:18px;color:#2563a8;text-decoration:none;font-weight:700";
  main.prepend(back);
}
