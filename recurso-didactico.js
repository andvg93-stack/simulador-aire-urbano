const config=window.RESOURCE;
const slider=document.getElementById("control");
const value=document.getElementById("value");
const fill=document.getElementById("fill");
const result=document.getElementById("result");
function render(){const v=Number(slider.value);const ratio=(v-config.min)/(config.max-config.min);value.textContent=v.toLocaleString("es-CO",{maximumFractionDigits:config.digits??0,minimumFractionDigits:config.digits??0});fill.style.width=`${Math.max(0,Math.min(100,ratio*100))}%`;result.textContent=config.explain(v,ratio)}
slider.addEventListener("input",render);render();
