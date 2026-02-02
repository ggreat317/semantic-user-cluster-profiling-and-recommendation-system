"use client"

import dynamic from "next/dynamic"

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false })
import { useCss } from "../../homepage/useCss"

export default function profileUMAP({ profile, self }) {
  const points = profile[0];
  const genres = profile[1];
  console.log("genres")
  console.log(genres)

  if (!Array.isArray(points)){
    console.log("invalid points");
    return <div>No Message Data Available</div>
  }

  function getGenre(label) {
    if (label == -1) return "Unassigned";

    const genre = genres[label][0];
    const sim = genres[label][1];

    if (sim >= 0.6) return genre;
    if (sim >= 0.4) return `Likely ${genre}`;
    if (sim >= 0.2) return `Possibly ${genre}`;
    return `Maybe ${genre}?`;
  }

  const colors = useCss(["--button", "--text", "--time"])

  const clusters = Object.groupBy(points, p => p.label)
  console.log("points")
  console.log(points)

  console.log("clusters")
  console.log(clusters)
  const traces = Object.entries(clusters).map(([label, pts]) => ({
    x: pts.map(p => p.umap3[0]),
    y: pts.map(p => p.umap3[1]),
    z: pts.map(p => p.umap3[2]),
    mode: "markers",
    type: "scatter3d",
    name: getGenre(label),
    marker: {
      size: label === "-1" ? 2 : 4,
      opacity: label === "-1" ? 0.3 : 0.85
    },
    //hoverinfo: "skip"
    hovertemplate: self ? "%{text} <extra></extra>" : label === "-1" ? "Unassigned" : "%{text}" ,
    text: self ? pts.map(p => wrapText(p.text)): pts.map(() => label) 
  }))

  return (
    <Plot
      data={traces}
      layout={{
        autosize:true,
        scene: {
          aspectmode: "cube",
          xaxis: { showticklabels: false },
          yaxis: { showticklabels: false },
          zaxis: { showticklabels: false }
        },
        legend: {
          orientation: "h",
          x: 0.5, 
          xanchor: "center",
          y: -0.15,      
          yanchor: "top"
        },
        margin: { l: 0, r: 0, b: 0, t: 0 },
        paper_bgcolor: colors["--button"],
        plot_bgcolor:  colors["--button"],
        font: { color:  colors["--text"] },
      }}
      style={{ width: "90%", height: "90%" }}
      useResizeHandler={true}
      config={{ displayModeBar: false }}
    />
  )
}

// surprisingly learned some of this from my recent class in for unix environments
function wrapText(text){
  const regex = new RegExp(`(.{1,20})`, 'g');
  return text.match(regex).join('<br>')
}

function annotateColor(genre, sim) {
  if (sim >= 0.6) return genre;
  if (sim >= 0.4) return `${genre}?`;
  if (sim >= 0.2) return `Possibly ${genre}`;
  return "Unclear";
}


  // if (!Array.isArray(points)){
  //   console.log("invalid points");
  //   return <div>No Message Data Available</div>
  // }

  // const colors = useCss(["--button", "--text", "--time"])

    // <Plot
    //   data={[
    //     {
    //       x: points.map(p => p.umap3[0]),
    //       y: points.map(p => p.umap3[1]),
    //       z: points.map(p => p.umap3[2]),
    //       mode: "markers",
    //       type: "scatter3d",
    //       marker: { size: 3, color: colors["--text"] }
    //     }
    //   ]}
    //   layout={{
    //     scene: {
    //       xaxis: { 
    //         title: "test",
    //         showticklabels: false, 
    //         showgrid: true, 
    //         zeroline: true, 
    //         visible: true 
    //       },
    //       yaxis: { 
    //         showticklabels: false, 
    //         showgrid: true, 
    //         zeroline: true, 
    //         visible: true 
    //       },
    //       zaxis: { 
    //         showticklabels: false, 
    //         showgrid: true, 
    //         zeroline: true, 
    //         visible: true 
    //       }
    //     },
    //     margin: { l: 0, r: 0, b: 0, t: 0 },
    //     paper_bgcolor: colors["--button"],
    //     plot_bgcolor:  colors["--button"],
    //     font: { color:  colors["--text"] },
    //   }}
    //   style={{ width: "100%", height: "100%" }}
    // />