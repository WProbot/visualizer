/**
 * External dependencies
 */
import { Chart } from 'react-google-charts';

import DataTable from './DataTable.js';

import { formatDate, filterCharts } from '../utils.js';

/**
 * WordPress dependencies
 */
const { startCase } = lodash;

const { __ } = wp.i18n;

const { apiFetch } = wp;

const {
	Component,
	Fragment
} = wp.element;

const {
	Button,
	Dashicon,
	ExternalLink,
	Notice,
	Placeholder,
	Spinner
} = wp.components;

class Charts extends Component {
	constructor() {
		super( ...arguments );

		this.loadMoreCharts = this.loadMoreCharts.bind( this );

		this.state = {
			charts: null,
			isBusy: false,
			chartsLoaded: false
		};
	}

	async componentDidMount() {

		// Fetch review again if block loaded after saving.
		let result = await apiFetch({ path: 'wp/v2/visualizer/?per_page=6&meta_key=visualizer-chart-library&meta_value=ChartJS' });
		this.setState({ charts: result });
	}

	async loadMoreCharts() {
		const offset = ( this.state.charts ).length;
		let chartsLoaded = this.state.chartsLoaded;

		this.setState({ isBusy: true });

		let result = await apiFetch({ path: `wp/v2/visualizer/?per_page=6&meta_key=visualizer-chart-library&meta_value=ChartJS&offset=${ offset }` });

		if ( 6 > result.length ) {
			chartsLoaded = true;
		}

		this.setState({
			charts: this.state.charts.concat( result ),
			isBusy: false,
			chartsLoaded
		});
	}

	render() {

		const { charts, isBusy, chartsLoaded } = this.state;

		return (
			<div className="visualizer-settings__charts">
				<Notice
					status="warning"
					isDismissible={ false }
				>
					{ __( 'ChartJS charts are currently not available for selection here, you must visit the library, get the shortcode, and add the chart here in a shortcode tag.' ) }

					<ExternalLink href={ visualizerLocalize.adminPage }>
						{ __( 'Click here to visit Visualizer Charts Library.' ) }
					</ExternalLink>
				</Notice>

				{
					( null !== charts ) ?
						( 1 <= charts.length ) ?
							<Fragment>

								<div className="visualizer-settings__charts-grid">

									{ ( Object.keys( charts ) ).map( i => {
										const data = formatDate( charts[i]['chart_data']);

										let title, chart;

										if ( data['visualizer-settings'].title ) {
											title = data['visualizer-settings'].title;
										} else {
											title = `#${charts[i].id}`;
										}

										if ( 0 <= [ 'gauge', 'table', 'timeline', 'dataTable' ].indexOf( data['visualizer-chart-type']) ) {
											if ( 'dataTable' === data['visualizer-chart-type']) {
												chart = data['visualizer-chart-type'];
											} else {
												chart = startCase( data['visualizer-chart-type']);
											}
										} else {
											chart = `${ startCase( data['visualizer-chart-type']) }Chart`;
										}

										if ( data['visualizer-chart-library']) {
											if ( 'ChartJS' === data['visualizer-chart-library']) {
												return;
											}
										}

										return (
											<div className="visualizer-settings__charts-single">

												<div className="visualizer-settings__charts-title">
													{ title }
												</div>

												{ ( 'dataTable' === chart ) ? (
													<DataTable
														id={ charts[i].id }
														rows={ data['visualizer-data'] }
														columns={ data['visualizer-series'] }
														chartsScreen={ true }
														options={ filterCharts( data['visualizer-settings']) }
													/>
												) : ( '' !== data['visualizer-data-exploded'] ? (
													<Chart
														chartType={ chart }
                                                        data={ data['visualizer-data-exploded'] }
														options={ filterCharts( data['visualizer-settings']) }
													/>
												) : (
													<Chart
														chartType={ chart }
														rows={ data['visualizer-data'] }
														columns={ data['visualizer-series'] }
														options={ filterCharts( data['visualizer-settings']) }
													/>
												) ) }

												<div
													className="visualizer-settings__charts-controls"
													title={ __( 'Insert Chart' ) }
													onClick={ () => this.props.getChart( charts[i].id ) }
												>
													<Dashicon icon="upload"></Dashicon>
												</div>

											</div>
										);
									}) }
								</div>

								{ ! chartsLoaded && 5 < charts.length && (
									<Button
										isPrimary
										isLarge
										onClick={ this.loadMoreCharts }
										isBusy={ isBusy }
									>
										{ __( 'Load More' ) }
									</Button>
								) }

							</Fragment>						:
							<p className="visualizer-no-charts">
								{ __( 'No charts found.' ) }
							</p>					:
						<Placeholder>
							<Spinner/>
						</Placeholder>
				}

			</div>
		);
	}
}

export default Charts;
