/**
 * Decent Skola24 library
 * 
 * Authors:
 * - Johannes <thexydez@gmail.com>
 * 
 * License:
 * - Public domain
 */

import axios from "axios";

/**
 * Constant header sent for all requests.
 */
const X_SCOPE = "8a22163c-8662-4535-9050-bc5e1923df48";

/**
 * Each unit represents a school
 */
interface Unit {
	guid: string;
	name: string;
}

/**
 * Each group represents a class
 */
interface Group {
	guid: string;
	name: string;
}

/**
 * Data for each lesson
 */
interface Lesson {
	guid: string;
	name: string;
	teacher: string;
	location: string;
	
	dayOfWeek: number;
	timeStart: string;
	timeEnd: string;
}

/**
 * Decent Skola24 library for NodeJS
 */
export class Skola24 {
	constructor(private host: string) {}

	public async units(): Promise<Unit[]> {
		const res = await axios.post(
			"https://web.skola24.se/api/services/skola24/get/timetable/viewer/units",
			{
				"getTimetableViewerUnitsRequest": {
					"hostName": "it-gymnasiet.skola24.se"
				}
			},
			{ headers: { "X-Scope": X_SCOPE } }
		);

		if (res.status !== 200) {
			throw Error(JSON.stringify(res.data));
		}

		if (res.data.error) {
			throw Error(JSON.stringify(res.data.error));
		}

		if (res.data.exception) {
			throw Error(JSON.stringify(res.data.exception));
		}

		if (res.data.validation && res.data.validation.length > 0) {
			throw Error(JSON.stringify(res.data.validation));
		}

		return res.data.data.getTimetableViewerUnitsResponse.units.map((v: any) => ({
			guid: v.unitGuid,
			name: v.unitId
		}));
	}

	public async groups(unitGuid: string): Promise<Group[]> {
		const res = await axios.post(
			"https://web.skola24.se/api/get/timetable/selection",
			{
				hostName: this.host,
				unitGuid: unitGuid,
				filters: {
					class: true,
					course: false,
					group: false,
					period: false,
					room: false,
					student: false,
					subject: false,
					teacher: false
				}
			},
			{ headers: { "X-Scope": X_SCOPE } }
		);

		if (res.status !== 200) {
			throw Error(JSON.stringify(res.data));
		}

		if (res.data.error) {
			throw Error(JSON.stringify(res.data.error));
		}

		if (res.data.exception) {
			throw Error(JSON.stringify(res.data.exception));
		}

		if (res.data.validation && res.data.validation.length > 0) {
			throw Error(JSON.stringify(res.data.validation));
		}

		return res.data.data.classes.map((v: any) => ({
			guid: v.groupGuid,
			name: v.groupName
		}));
	}

	private async renderKey(): Promise<string> {
		const res = await axios.get("https://web.skola24.se/api/get/timetable/render/key", {
			headers: { "X-Scope": X_SCOPE }
		});

		if (res.status !== 200) {
			throw Error(JSON.stringify(res.data));
		}

		if (res.data.error) {
			throw Error(JSON.stringify(res.data.error));
		}

		if (res.data.exception) {
			throw Error(JSON.stringify(res.data.exception));
		}

		if (res.data.validation && res.data.validation.length > 0) {
			throw Error(JSON.stringify(res.data.validation));
		}

		return res.data.data.key;
	}

	public async timetable(unitGuid: string, groupGuid: string, year: number, week: number): Promise<Lesson[]> {
		const renderKey = await this.renderKey();

		console.debug(`unitGuid: ${unitGuid}`);
		console.debug(`groupGuid: ${groupGuid}`);
		console.debug(`renderKey: ${renderKey}`);

		const res = await axios.post(
			"https://web.skola24.se/api/render/timetable",
			{
				renderKey,
				host: this.host,
				unitGuid,
				startDate: null,
				endDate: null,
				scheduleDay: 0,
				blackAndWhite: false,
				width: 512,
				height: 512,
				selectionType: 0, // <- Select whole week
				selection: groupGuid,
				showHeader: false,
				periodText: "",
				week,
				year,
				privateFreeTextMode: null,
				privateSelectionMode: false,
				customerKey: ""
			},
			{
				headers: { "X-Scope": X_SCOPE }
			}
		);

		if (res.status !== 200) {
			throw Error(JSON.stringify(res.data));
		}

		if (res.data.error) {
			throw Error(JSON.stringify(res.data.error));
		}

		if (res.data.exception) {
			throw Error(JSON.stringify(res.data.exception));
		}

		if (res.data.validation && res.data.validation.length > 0) {
			throw Error(JSON.stringify(res.data.validation));
		}

		console.dir(res.data);

		return res.data.data.lessonInfo.map((v: any) => ({
			guid: v.guidId,
			name: v.texts[0],
			teacher: v.texts[1],
			location: v.texts[2],
			dayOfWeek: v.dayOfWeekNumber,
			timeStart: v.timeStart,
			timeEnd: v.timeEnd
		}));
	}
}
