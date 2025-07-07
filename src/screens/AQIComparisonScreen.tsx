import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions,
  Animated,
  Easing
} from 'react-native';
import LineChart from 'react-native-svg-charts/src/line-chart';
import BarChart from 'react-native-svg-charts/src/bar-chart';
import { LinearGradient, Stop, Defs } from 'react-native-svg';
import { Circle, G, Text as SvgText } from 'react-native-svg';
import * as shape from 'd3-shape';

const screenWidth = Dimensions.get('window').width;
const chartHeight = 200;

interface DecoratorProps {
  x: (index: number) => number;
  y: (value: number) => number;
  data: number[];
  color: string;
}

export default function AQIComparisonScreen() {
  const indoorData = [38, 42, 40, 45, 41, 39, 38];
  const outdoorData = [90, 85, 95, 100, 102, 97, 95];
  const times = ['8AM', '10AM', '12PM', '2PM', '4PM', '6PM', '8PM'];
  const AQIRange = Array.from({ length: 11 }, (_, i) => i * 100).reverse();
  
  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideUpAnim = React.useRef(new Animated.Value(30)).current;
  const pulseValue = React.useRef(new Animated.Value(1)).current;
  
  React.useEffect(() => {
    // Entry animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true
      })
    ]).start();

    // Pulse animation for data points
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false  // Must be false for SVG animations
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false  // Must be false for SVG animations
        })
      ])
    ).start();
  }, []);

  const Gradient = ({ id, color }: { id: string; color: string }) => (
    <Defs key={id}>
      <LinearGradient id={id} x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor={color} stopOpacity={0.8}/>
        <Stop offset="100%" stopColor={color} stopOpacity={0.1}/>
      </LinearGradient>
    </Defs>
  );

 const Decorator = ({ x, y, data, color }: DecoratorProps) => {
  const AnimatedCircle = Animated.createAnimatedComponent(Circle);
  
  return (
    <>
      {data.map((value, index) => (
        <G key={index}>
          <AnimatedCircle 
            cx={x(index)} 
            cy={y(value)} 
            r={6} 
            fill={color}
            transform={`scale(${pulseValue})`}  // Changed from style to transform
          />
          <SvgText
            x={x(index)}
            y={y(value) - 15}
            fontSize={12}
            fill="#fff"
            fontWeight="bold"
            alignmentBaseline="middle"
            textAnchor="middle"
          >
            {value}
          </SvgText>
        </G>
      ))}
    </>
  );
};

  const renderChartBlock = (label: string, data: number[], color: string) => (
    <Animated.View style={[
      styles.chartRow,
      { 
        opacity: fadeAnim,
        transform: [{ translateY: slideUpAnim }] 
      }
    ]}>
      <View style={styles.yAxis}>
        {AQIRange.map((v, i) => (
          <Text key={i} style={styles.yAxisLabel}>
            {v}
          </Text>
        ))}
      </View>
      <View style={styles.chartContainer}>
        <Text style={[styles.chartLabel, { color }]}>{label}</Text>
        <View style={styles.chartWrapper}>
          <LineChart
            style={styles.chart}
            data={data}
            svg={{ 
              stroke: color,
              strokeWidth: 3,
            }}
            curve={shape.curveNatural}
            contentInset={{ top: 20, bottom: 20 }}
            yMin={0}
            yMax={300}
          >
            <Gradient id={`gradient-${label}`} color={color} />
            <Decorator 
              x={(index: number) => (screenWidth - 80) * (index / (data.length - 1))}
              y={(value: number) => chartHeight - 40 - ((value / 300) * (chartHeight - 40))}
              data={data} 
              color={color} 
            />
          </LineChart>
          <BarChart
            style={[StyleSheet.absoluteFill, styles.areaChart]}
            data={data}
            svg={{ fill: `url(#gradient-${label})` }}
            curve={shape.curveNatural}
            contentInset={{ top: 20, bottom: 20 }}
            yMin={0}
            yMax={300}
          />
        </View>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <Animated.Text style={[
        styles.title,
        { 
          opacity: fadeAnim,
          transform: [{ translateY: slideUpAnim }]
        }
      ]}>
        INDOOR VS OUTDOOR AQI
      </Animated.Text>
      
      {renderChartBlock('INDOOR', indoorData, '#00e676')}
      {renderChartBlock('OUTDOOR', outdoorData, '#ff3d00')}

      <Animated.View style={[
        styles.timeLabels,
        { 
          opacity: fadeAnim,
          transform: [{ translateY: slideUpAnim }]
        }
      ]}>
        {times.map((t, i) => (
          <Text key={i} style={styles.timeLabel}>
            {t}
          </Text>
        ))}
      </Animated.View>
      
      {/* Background grid lines */}
      <View style={styles.gridLines}>
        {[0, 1, 2, 3, 4, 5, 6].map((_, i) => (
          <View key={i} style={styles.gridLine} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a192f',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 30,
    color: '#64ffda',
    letterSpacing: 1.5,
  },
  chartRow: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  chartContainer: {
    flex: 1,
  },
  chartWrapper: {
    height: chartHeight,
    position: 'relative',
  },
  chart: {
    height: chartHeight,
    width: '100%',
  },
  areaChart: {
    height: chartHeight,
    width: '100%',
    opacity: 0.3,
  },
  yAxis: {
    width: 40,
    justifyContent: 'space-between',
    height: chartHeight,
    marginRight: 10,
  },
  yAxisLabel: {
    fontSize: 10,
    color: '#64ffda',
    textAlign: 'right',
    opacity: 0.7,
  },
  chartLabel: {
    fontSize: 14,
    marginBottom: 10,
    fontWeight: '700',
    marginLeft: 10,
    letterSpacing: 1,
  },
  timeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -10,
    paddingHorizontal: 15,
    marginLeft: 50,
  },
  timeLabel: {
    fontSize: 11,
    color: '#64ffda',
    opacity: 0.7,
  },
  gridLines: {
    position: 'absolute',
    top: 0,
    left: 50,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: -1,
  },
  gridLine: {
    width: 1,
    backgroundColor: 'rgba(100, 255, 218, 0.1)',
    marginHorizontal: (screenWidth - 80) / 12,
  },
});