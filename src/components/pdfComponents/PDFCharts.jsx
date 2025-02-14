import React, { useRef, useState } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import Chart from "chart.js/auto";
import { CategoryScale } from "chart.js"

const ChartComponent = ({ type }) => {
    const chartRef = useRef(null);
    const [base64Image, setBase64Image] = useState('');

    const generateBase64Image = () => {
        if (chartRef && chartRef.current) {
            const chartCanvas = chartRef.current.canvas;
            const base64String = chartCanvas.toDataURL('image/png');
            console.log(base64String);
            setBase64Image(base64String);
        }
    };

    const data = {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
        datasets: [{
            label: 'My First Dataset',
            data: [65, 59, 80, 81, 56, 55, 40],
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
        }]
    };

    const pieChartdata = {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [
            {
                label: '# of Votes',
                data: [12, 19, 3, 5, 2, 3],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    const UserData = [
        {
            id: 1,
            year: 2016,
            userGain: 80000,
            userLost: 823,
        },
        {
            id: 2,
            year: 2017,
            userGain: 45677,
            userLost: 345,
        },
        {
            id: 3,
            year: 2018,
            userGain: 78888,
            userLost: 555,
        },
        {
            id: 4,
            year: 2019,
            userGain: 90000,
            userLost: 4555,
        },
        {
            id: 5,
            year: 2020,
            userGain: 4300,
            userLost: 234,
        },
    ]
    const barChartData = {
        labels: UserData.map(o => o.year),
        datasets: [
            {
                label: 'Users Gained',
                backgroundColor: 'rgba(0, 255, 0, 0.2)',
                borderColor: 'rgb(0, 255, 0)',
                borderWidth: 1,
                data: UserData.map(o => o.userGain)
            }
        ]
    }

    return (
        <div>
            <button onClick={generateBase64Image}>Generate Base64 Image</button>
            {base64Image && (
                <div>
                    <h2>Base64 Image URL:</h2>
                    <img src={base64Image} alt="chart" />
                </div>
            )}
            {type === 'line'
                &&
                <Line ref={chartRef} data={data}
                // style={{ visibility: 'hidden' }}
                />
            }
            {type === 'pie'
                &&
                <Pie ref={chartRef} data={pieChartdata}
                // style={{ visibility: 'hidden' }}
                />
            }
            {type === 'bar'
                &&
                <Bar ref={chartRef} data={barChartData}
                // style={{ visibility: 'hidden' }}
                />
            }
        </div>
    );
};

export default ChartComponent;
