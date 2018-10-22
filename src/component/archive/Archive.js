import React, { Component } from 'react';

import { Col, Row } from 'reactstrap';
import { Button, ButtonGroup, ButtonToolbar } from 'reactstrap';
import { Table } from 'reactstrap';

import { Link } from 'react-router-dom'

import { ReleaseImagesTitled } from '../ReleaseImages';
import { Histogram, BinnedScatter } from '../chart';

import { groupedData, urlStringForProductName } from '../../utils';
import { FilterSummary } from '../../state';

class ArchiveDisplayControls extends Component {

  buttonClicked(option) {
    if ("images" === option) this.props.handlers.onArchiveDisplaySetImages()
    else if ("text" === option) this.props.handlers.onArchiveDisplaySetText()
  }

  render() {
    return <ButtonToolbar role="toolbar">
      <ButtonGroup style={{width: "100%"}} size="sm">
        <Button style={{width: "100%"}}
          onClick={() => this.buttonClicked("images")}
          active={this.props.settings.showImages}
          color={(this.props.settings.showImages) ? "primary" : "secondary"}>
          Images
        </Button>
        <Button style={{width: "100%"}}
          onClick={() => this.buttonClicked("text")}
          active={!this.props.settings.showImages}
          color={(!this.props.settings.showImages) ? "primary" : "secondary"}>
          Text Only
        </Button>
      </ButtonGroup>
    </ButtonToolbar>
  }
}

// Grouping controls -- maybe later
// class ArchiveListingControls extends Component {
//
//   buttonClicked(option) {
//     if ("chronological" === option) this.props.handlers.onArchiveDisplaySetChronological()
//     else if ("grouped" === option) this.props.handlers.onArchiveDisplaySetGrouped()
//   }
//
//   render() {
//     return <ButtonToolbar role="toolbar">
//       <ButtonGroup style={{width: "100%"}} size="sm">
//         <Button style={{width: "100%"}}
//           onClick={() => this.buttonClicked("chronological")}
//           active={"chronological" === this.props.settings.listing}>
//           Chronological
//         </Button>
//         <Button style={{width: "100%"}}
//           onClick={() => this.buttonClicked("grouped")}
//           active={"grouped" === this.props.settings.listing}>
//           Grouped
//         </Button>
//       </ButtonGroup>
//     </ButtonToolbar>
//   }
// }

class ArchiveFilterGroup extends Component {
  onClick(filter) { this.props.onToggle(filter); }

  render() {
    const filters = this.props.filters;
    if (filters == null) return <p></p>
    const filterButtons = filters.map(f =>
      <Button key={f.type} style={{width: "100%"}}
        onClick={() => this.onClick(f)}
        active={f.isOn}
        color={(f.isOn) ? "primary" : "secondary"}>
        {f.type}
      </Button>
    );

    return <div>
      <span style={{fontWeight: "bold"}}>{this.props.name}</span>
      <ButtonToolbar role="toolbar">
        <ButtonGroup style={{width: "100%"}} size="sm">
          {filterButtons}
        </ButtonGroup>
      </ButtonToolbar>
    </div>
  }
}

class ArchiveFilters extends Component {
  constructor(props) {
    super(props);
    this.state = { expanded: false }
    this.onExpand = this.clickedExpand.bind(this);
  }

  clickedExpand(e) {
    e.preventDefault();
    this.setState({expanded: !this.state.expanded });
  }

  onClearAll() { this.props.handlers.onArchiveFilterClearAll(); }

  render() {
    const expanded = this.state.expanded;
    const onToggle = this.props.handlers.onArchiveFilterToggle;
    const filters = this.props.filters;
    const filterSummary = new FilterSummary(filters).compute();
    const filterHeader = `Filters: ${filterSummary}`;
    // const filterGroups = ["Category", "Clothes", "Experiments", "Season", "Fabrics"];
    const filterGroups = ["Category", "Experiment", "Season"];
    const filterMap = {
      Category: filters.Category,
      Experiment: filters.Experiment,
      Season: filters.Season
    }
    const filtersUI = (expanded) ?
      filterGroups.map(g =>
        <ArchiveFilterGroup key={g} name={g} filters={filterMap[g]} onToggle={onToggle} />
      ) :
      null;
    const clearButton = (filterSummary !== "(show all)") ?
      <Button key="clearAll" style={{width: "100%"}} size="sm"
          onClick={() => this.onClearAll()}>
            Clear All
      </Button> :
      null;

    return <div>
      <a href="" onClick={this.onExpand}><p><b>{filterHeader}</b></p></a>
      {clearButton}
      {filtersUI}
    </div>
  }
}

class ArchiveControls extends Component {
  render() {
    return [
      <Row key="display"><Col>
        <ArchiveDisplayControls settings={this.props.settings.display} handlers={this.props.handlers} />
      </Col></Row>,
      // Grouping feature -- maybe later
      // <Row key="grouping" style={{"marginTop": 2}}><Col>
      //   <ArchiveListingControls settings={this.props.settings.display} handlers={this.props.handlers} />
      // </Col></Row>,
      <Row key="filters"><Col><ArchiveFilters filters={this.props.settings.filters} handlers={this.props.handlers} /></Col></Row>,
    ]
  }
}

class ArchiveSummary extends Component {
  render() {
    const summary = this.props.summary;
    if (summary == null) return <p></p>;
    const data = this.props.data;
    const totalNumberOfEntries = (data.full) ? data.full.length : 0;
    const numberOfEntries = (data.filtered) ? data.filtered.length : 0;
    const sizeText =
      (numberOfEntries === totalNumberOfEntries) ?
        `${totalNumberOfEntries} entries` :
        `${numberOfEntries} of ${totalNumberOfEntries} entries`;
    const monthHistogram = summary.monthHistogram;
    const seasonHistogram = summary.seasonHistogram;
    const priceHistogram = summary.priceHistogram;
    const releaseGapWeeks = summary.releaseGapWeeks;
    return [
      <p key="sizetext">{sizeText}</p>,
      <div key="summary" className="d-flex flex-wrap">
        <div>
          <h3 key="seasonHeader">Season</h3>
          <Histogram key="seasonHistogram" data={seasonHistogram} width={175} />
        </div>
        <div>
          <h3 key="monthHeader">Month</h3>
          <Histogram key="monthHistogram" data={monthHistogram} width={175}  />
        </div>
        <div>
          <h3 key="priceHeader">Price
            <span style={{fontSize: 'small', fontWeight: 'normal'}}> (Median ${`${summary.priceMedian}`})</span>
          </h3>
          <Histogram key="priceHistogram" data={priceHistogram} labellength={-1} width={175} />
        </div>
        <div>
          <h3 key="releaseDurationHeader">Release Gap <span style={{fontSize: 'small', fontWeight: 'normal'}}>(weeks)</span></h3>
          <BinnedScatter key="releaseDuration" data={releaseGapWeeks} width={175} />
        </div>
      </div>
    ]
  }
}

class ArchiveImageGroup extends Component {
  render() {
    const group = this.props.group;
    const showTitle = this.props.showTitle;
    const title = (showTitle) ? <h3>{group.name}</h3> : <span></span>;
    return <Row>
      <Col>
        {title}
        <ReleaseImagesTitled releases={group.entries} productUrl={this.props.productUrl} />
      </Col>
    </Row>
  }
}

class ArchiveWithImages extends Component {
  render() {
    const groups = groupedData(this.props.data, this.props.settings);
    const children =
      groups.map(g =>
        <ArchiveImageGroup
          key={g.name} group={g} showTitle={groups.length > 1}
          productUrl={this.props.productUrl} />);
    return children
  }
}

class ArchiveTextGroupRow extends Component {
  render() {
    const entry = this.props.entry;
    const name = this.props.name;
    const showTitle = this.props.showTitle;
    const index = this.props.index;
    const price = (entry.Price !== "") ? `$${entry.Price}` : "";
    let groupTitle = null;
    if (showTitle) {
      groupTitle = (index < 1) ?
        <th scope="row">{name}</th> :
        <td></td>
    }
    return <tr key={index}>
      {groupTitle}
      <td>
        <Link to={`${this.props.productUrl}/${urlStringForProductName(entry.Product)}`}>
          {entry.Product}
        </Link>
      </td>
      <td>{price}</td>
      <td>{entry.Release}</td>
    </tr>
  }
}


class ArchiveTextGroupRows extends Component {
  render() {
    const group = this.props.group;
    const showTitle = this.props.showTitle;
    const entries = group.entries;
    return entries.map((d, i) =>
      <ArchiveTextGroupRow key={i} entry={d} name={group.name} showTitle={showTitle}
        index={i} /> )
  }
}

class ArchiveWithText extends Component {
  render() {
    const groups = groupedData(this.props.data, this.props.settings);
    const showTitle = groups.length > 1;
    const tableHead = (showTitle) ?
      <tr><th>Group</th><th>Product</th><th>Price</th><th>Release</th></tr> :
      <tr><th>Product</th><th>Price</th><th>Release</th></tr>
    const rows =
      groups.map(g =>
        <ArchiveTextGroupRows
          key={g.name} group={g} showTitle={groups.length > 1}
          productUrl={this.props.productUrl} />);
    return <Row>
      <Col>
        <Table size="sm">
          <thead>
            {tableHead}
          </thead>
          <tbody>
            {rows}
          </tbody>
        </Table>
      </Col>
    </Row>
  }
}

class ArchiveBody extends Component {
  render() {
    const data = this.props.data;
    const settings = this.props.settings;
    if (settings.display.showImages === true)
      return <ArchiveWithImages
        data={data} settings={settings} productUrl={this.props.productUrl} />
    else
      return <ArchiveWithText
        data={data} settings={settings} productUrl={this.props.productUrl} />
  }
}

class Archive extends Component {
  render() {
    const data = this.props.archive.data;
    const settings = this.props.archive.settings;
    const handlers = this.props.handlers;
    const summary = this.props.summary;
    return [
      <Row key="dash">
        <Col md={4}><ArchiveControls settings={settings} handlers={handlers.displaySettingHandlers}/></Col>
        <Col md={8}><ArchiveSummary data={data} summary={summary} /></Col>
      </Row>,
      <Row key="data">
        <Col xs={12}>
          <ArchiveBody productUrl={this.props.productUrl} data={data} settings={settings} />
        </Col>
      </Row>
    ]
  }
}

export default Archive;