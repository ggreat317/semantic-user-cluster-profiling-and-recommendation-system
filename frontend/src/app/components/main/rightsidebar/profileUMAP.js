"use client"

import dynamic from "next/dynamic"

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false })
import { useCss } from "../../homepage/useCss"

export default function profileUMAP({ points }) {

  if (!Array.isArray(points)){
    console.log("invalid points");
    return <div>No Message Data Available</div>
  }

  const colors = useCss(["--button", "--text", "--time"])

  const clusters = Object.groupBy(points, p => p.label)

  const traces = Object.entries(clusters).map(([label, pts]) => ({
    x: pts.map(p => p.umap3[0]),
    y: pts.map(p => p.umap3[1]),
    z: pts.map(p => p.umap3[2]),
    mode: "markers",
    type: "scatter3d",
    name: label === "-1" ? "Unassigned" : `Cluster ${label}`,
    marker: {
      size: label === "-1" ? 2 : 4,
      opacity: label === "-1" ? 0.3 : 0.85
    }
  }))

  return (
    <Plot
      data={traces}
      layout={{
        scene: {
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
    />
  )
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