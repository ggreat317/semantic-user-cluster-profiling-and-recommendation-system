"use client"

import dynamic from "next/dynamic"

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false })
import { useCss } from "../../homepage/useCss"

export default function profileUMAP({ points }) {

  if (!Array.isArray(points)){
    console.log("invalid points");
    console.log(points);
    return <div>No Message Data Available</div>
  }


  const colors = useCss(["--button", "--text", "--time"])

  return (
    <Plot
      data={[
        {
          x: points.map(p => p[0]),
          y: points.map(p => p[1]),
          z: points.map(p => p[2]),
          mode: "markers",
          type: "scatter3d",
          marker: { size: 4, color: "cyan" }
        }
      ]}
      layout={{
        scene: {
          xaxis: { 
            title: "test",
            showticklabels: false, 
            showgrid: true, 
            zeroline: true, 
            visible: true 
          },
          yaxis: { 
            showticklabels: false, 
            showgrid: true, 
            zeroline: true, 
            visible: true 
          },
          zaxis: { 
            showticklabels: false, 
            showgrid: true, 
            zeroline: true, 
            visible: true 
          }
        },
        margin: { l: 0, r: 0, b: 0, t: 0 },
        paper_bgcolor: colors["--button"],
        plot_bgcolor:  colors["--button"],
        font: { color:  colors["--text"] },
      }}
      style={{ width: "100%", height: "100%" }}
    />
  )
}